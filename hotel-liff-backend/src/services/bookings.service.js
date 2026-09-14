import { createSupabaseClient } from '../config/supabaseClient.js'
import { todayInBangkok, addDaysToDateString, daysBetween } from '../utils/dateTz.js'
import { getHotelInfo } from './hotelInfo.service.js'

export class BookingValidationError extends Error {
  constructor(message) {
    super(message)
    this.status = 400
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

async function findOrCreateUser(supabase, lineUserId, displayName) {
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing.id

  const { data: created, error: createError } = await supabase
    .from('users')
    .insert({ line_user_id: lineUserId, display_name: displayName })
    .select('id')
    .single()

  if (createError) throw createError
  return created.id
}

export async function createBooking({ lineUserId, displayName, roomType, checkIn, checkOut, guests, idempotencyKey }) {
  const hotelInfo = await getHotelInfo()
  const errors = validateBookingInput({ checkIn, checkOut, guests, hotelInfo })
  if (errors.length > 0) {
    throw new BookingValidationError(errors[0])
  }

  const supabase = createSupabaseClient()
  const userId = await findOrCreateUser(supabase, lineUserId, displayName)

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
  return data
}
