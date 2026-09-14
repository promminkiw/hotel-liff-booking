import { createSupabaseClient } from '../config/supabaseClient.js'
import { todayInBangkok, addDaysToDateString, daysBetween } from '../utils/dateTz.js'
import { getHotelInfo } from './hotelInfo.service.js'
import { sendPushMessage } from './lineMessaging.service.js'
import { findOrCreateUser } from './users.service.js'

function formatBaht(amount) {
  return `${Number(amount).toLocaleString('th-TH')} บาท`
}

export class BookingValidationError extends Error {
  constructor(message) {
    super(message)
    this.status = 400
  }
}

export class BookingNotFoundError extends Error {
  constructor(message = 'ไม่พบการจองนี้') {
    super(message)
    this.status = 404
  }
}

// Pure validation logic, kept separate from any DB calls so it can be unit
// tested directly. hotelInfo carries cancellation_days_before,
// max_advance_booking_days, max_length_of_stay_nights.
export function validateBookingInput({ checkIn, checkOut, guests, hotelInfo, today = todayInBangkok() }) {
  const errors = []

  if (!checkIn || !checkOut) {
    errors.push('กรุณาระบุวันเช็คอินและเช็คเอาท์')
    return errors
  }
  if (checkIn < today) {
    errors.push('ไม่สามารถจองวันที่ผ่านมาแล้วได้')
  }
  if (checkOut <= checkIn) {
    errors.push('วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน')
  }
  if (!guests || guests < 1) {
    errors.push('จำนวนผู้เข้าพักต้องมากกว่า 0')
  }

  if (checkOut > checkIn && hotelInfo) {
    const nights = daysBetween(checkIn, checkOut)
    if (nights > hotelInfo.max_length_of_stay_nights) {
      errors.push(`ระบบรองรับการเข้าพักไม่เกิน ${hotelInfo.max_length_of_stay_nights} คืนต่อการจอง`)
    }

    const maxCheckIn = addDaysToDateString(today, hotelInfo.max_advance_booking_days)
    if (checkIn > maxCheckIn) {
      errors.push(`ระบบรองรับการจองล่วงหน้าไม่เกิน ${hotelInfo.max_advance_booking_days} วัน`)
    }
  }

  return errors
}

// Never mutates booking.status in the DB - just what to show. 4.14: instead
// of a cron job flipping confirmed -> completed after checkout, the
// "completed" state is computed here, every time bookings are displayed.
export function getVirtualStatus(booking, today = todayInBangkok()) {
  if (booking.status === 'confirmed' && booking.check_out < today) {
    return 'completed'
  }
  return booking.status
}

// Pure: given the booking's virtual status and the hotel's cancellation
// policy, returns a user-facing error message if cancellation should be
// refused, or null if it's allowed.
export function getCancellationError({ status, checkIn, cancellationDaysBefore, today = todayInBangkok() }) {
  if (status === 'cancelled') {
    return 'การจองนี้ถูกยกเลิกไปแล้ว'
  }
  if (status !== 'pending' && status !== 'confirmed') {
    return 'ไม่สามารถยกเลิกการจองนี้ได้ เนื่องจากเข้าพักเสร็จสิ้นแล้ว'
  }

  const minCheckIn = addDaysToDateString(today, cancellationDaysBefore)
  if (checkIn < minCheckIn) {
    return 'ไม่สามารถยกเลิกได้แล้ว เนื่องจากใกล้วันเข้าพัก กรุณาติดต่อโรงแรมโดยตรง'
  }

  return null
}

export async function createBooking({ lineUserId, displayName, roomType, checkIn, checkOut, guests, idempotencyKey }) {
  const hotelInfo = await getHotelInfo()
  const errors = validateBookingInput({ checkIn, checkOut, guests, hotelInfo })
  if (errors.length > 0) {
    throw new BookingValidationError(errors[0])
  }

  const supabase = createSupabaseClient()
  const userId = await findOrCreateUser(lineUserId, displayName)

  const { data, error } = await supabase.rpc('create_booking_atomic', {
    p_user_id: userId,
    p_room_type: roomType,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: guests,
    p_idempotency_key: idempotencyKey ?? null,
  })

  if (error) {
    if (error.message?.includes('NO_ROOM_AVAILABLE')) {
      throw new BookingValidationError(`ขออภัยครับ ห้อง${roomType}ไม่ว่างในช่วงวันที่เลือก`)
    }
    throw error
  }

  await sendPushMessage(
    lineUserId,
    [
      'จองห้องพักสำเร็จ ✅',
      `ประเภทห้อง: ${roomType}`,
      `เช็คอิน: ${data.check_in}`,
      `เช็คเอาท์: ${data.check_out}`,
      `รหัสการจอง: ${data.booking_code}`,
      `ยอดรวม: ${formatBaht(data.total_price)}`,
    ].join('\n'),
  )

  return data
}

export async function listBookingsByUser(lineUserId) {
  const supabase = createSupabaseClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(name, room_type, image_url)')
    .eq('user_id', user.id)
    .order('check_in', { ascending: false })

  if (error) throw error
  return data.map((booking) => ({ ...booking, displayStatus: getVirtualStatus(booking) }))
}

export async function cancelBooking({ bookingId, lineUserId }) {
  const supabase = createSupabaseClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (userError) throw userError
  if (!user) throw new BookingNotFoundError()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingError) throw bookingError
  if (!booking || booking.user_id !== user.id) {
    throw new BookingNotFoundError()
  }

  const hotelInfo = await getHotelInfo()
  const cancelError = getCancellationError({
    status: getVirtualStatus(booking),
    checkIn: booking.check_in,
    cancellationDaysBefore: hotelInfo.cancellation_days_before,
  })
  if (cancelError) {
    throw new BookingValidationError(cancelError)
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select('*, rooms(name, room_type, image_url)')
    .single()

  if (updateError) throw updateError

  await sendPushMessage(
    lineUserId,
    [
      'ยกเลิกการจองแล้ว',
      `ห้อง: ${updated.rooms?.name ?? updated.rooms?.room_type ?? ''}`,
      `รหัสการจอง: ${updated.booking_code}`,
    ].join('\n'),
  )

  return updated
}

// Looks a booking up by its human-facing code (what a user types in chat)
// and delegates to cancelBooking - same ownership check and cancellation
// policy, no separate code path to keep in sync.
export async function cancelBookingByCode({ bookingCode, lineUserId }) {
  const supabase = createSupabaseClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_code', bookingCode)
    .maybeSingle()

  if (error) throw error
  if (!booking) throw new BookingNotFoundError()

  return cancelBooking({ bookingId: booking.id, lineUserId })
}
