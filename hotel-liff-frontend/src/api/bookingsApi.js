import { httpClient } from './httpClient.js'

export function checkAvailability({ roomType, checkIn, checkOut, guests }) {
  return httpClient.post('/api/rooms/check-availability', { roomType, checkIn, checkOut, guests })
}

export function createBooking({ lineUserId, displayName, roomType, checkIn, checkOut, guests, idempotencyKey }) {
  return httpClient.post('/api/bookings', {
    lineUserId,
    displayName,
    roomType,
    checkIn,
    checkOut,
    guests,
    idempotencyKey,
  })
}

export function fetchMyBookings(lineUserId) {
  return httpClient.get(`/api/bookings?lineUserId=${encodeURIComponent(lineUserId)}`)
}

export function fetchAvailabilityCalendar({ roomType, month }) {
  const params = new URLSearchParams({ room_type: roomType, month })
  return httpClient.get(`/api/rooms/availability-calendar?${params.toString()}`)
}
