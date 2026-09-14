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
