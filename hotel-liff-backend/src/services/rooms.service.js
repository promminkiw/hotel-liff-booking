import { createSupabaseClient } from '../config/supabaseClient.js'
import { daysInMonth, addDaysToDateString } from '../utils/dateTz.js'
import { datesOverlap } from '../utils/dateOverlap.js'

const ROOM_COLUMNS =
  'id, room_number, room_type, name, description, price_per_night, max_guests, bed_type, amenities, image_url, status'

export async function listRooms({ roomType, guests } = {}) {
  const supabase = createSupabaseClient()
  let query = supabase
    .from('rooms')
    .select(ROOM_COLUMNS)
    .eq('status', 'active')
    .order('room_type', { ascending: true })
    .order('room_number', { ascending: true })

  if (roomType) {
    query = query.eq('room_type', roomType)
  }
  if (guests) {
    query = query.gte('max_guests', guests)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getRoomById(id) {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('rooms').select(ROOM_COLUMNS).eq('id', id).maybeSingle()

  if (error) throw error
  return data
}

// Read-only preview of availability across every room of a room_type, used
// to show "N rooms available" before the user confirms. This is NOT the
// path that actually reserves a room - create_booking_atomic (called from
// bookings.service.js) re-checks and locks atomically, so a stale read
// here can never cause a double-booking.
export async function checkRoomTypeAvailability({ roomType, checkIn, checkOut, guests }) {
  const supabase = createSupabaseClient()

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id, price_per_night')
    .eq('room_type', roomType)
    .eq('status', 'active')
    .gte('max_guests', guests)

  if (roomsError) throw roomsError
  if (rooms.length === 0) {
    return { available: false, count: 0, pricePerNight: null }
  }

  const roomIds = rooms.map((r) => r.id)
  const { data: overlapping, error: bookingsError } = await supabase
    .from('bookings')
    .select('room_id')
    .in('room_id', roomIds)
    .in('status', ['pending', 'confirmed'])
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)

  if (bookingsError) throw bookingsError

  const bookedRoomIds = new Set(overlapping.map((b) => b.room_id))
  const availableRooms = rooms.filter((r) => !bookedRoomIds.has(r.id))

  return {
    available: availableRooms.length > 0,
    count: availableRooms.length,
    pricePerNight: availableRooms.length > 0 ? Math.min(...availableRooms.map((r) => r.price_per_night)) : null,
  }
}

// One month of per-day availability for a room_type, used to render the
// booking calendar. For each day, availableCount = how many active rooms
// of this type have no overlapping booking that day.
export async function getAvailabilityCalendar({ roomType, month }) {
  const supabase = createSupabaseClient()
  const days = daysInMonth(month)
  const monthStart = days[0]
  const monthEnd = addDaysToDateString(days[days.length - 1], 1) // exclusive

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id')
    .eq('room_type', roomType)
    .eq('status', 'active')

  if (roomsError) throw roomsError
  const totalRooms = rooms.length

  if (totalRooms === 0) {
    return { totalRooms: 0, days: days.map((date) => ({ date, availableCount: 0 })) }
  }

  const roomIds = rooms.map((r) => r.id)
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .in('room_id', roomIds)
    .in('status', ['pending', 'confirmed'])
    .lt('check_in', monthEnd)
    .gt('check_out', monthStart)

  if (bookingsError) throw bookingsError

  const calendarDays = days.map((date) => {
    const nextDay = addDaysToDateString(date, 1)
    const bookedCount = bookings.filter((b) => datesOverlap(b.check_in, b.check_out, date, nextDay)).length
    return { date, availableCount: Math.max(totalRooms - bookedCount, 0) }
  })

  return { totalRooms, days: calendarDays }
}
