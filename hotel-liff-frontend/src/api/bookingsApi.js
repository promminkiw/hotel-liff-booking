import { httpClient } from './httpClient.js'

function authHeaders(idToken) {
  return { headers: { Authorization: `Bearer ${idToken}` } }
}

export function checkAvailability({ roomType, checkIn, checkOut, guests }) {
  return httpClient.post('/api/rooms/check-availability', { roomType, checkIn, checkOut, guests })
}

export function createBooking({ idToken, roomType, checkIn, checkOut, guests, idempotencyKey }) {
  return httpClient.post(
    '/api/bookings',
    { roomType, checkIn, checkOut, guests, idempotencyKey },
    authHeaders(idToken),
  )
}

export function fetchMyBookings(idToken) {
  return httpClient.get('/api/bookings', authHeaders(idToken))
}

export function fetchAvailabilityCalendar({ roomType, month }) {
  const params = new URLSearchParams({ room_type: roomType, month })
  return httpClient.get(`/api/rooms/availability-calendar?${params.toString()}`)
}

export function cancelBooking(bookingId, idToken) {
  return httpClient.patch(`/api/bookings/${bookingId}/cancel`, {}, authHeaders(idToken))
}
