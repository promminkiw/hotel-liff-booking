import { httpClient } from './httpClient.js'

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function adminLogin(password) {
  return httpClient.post('/api/admin/login', { password })
}

export function fetchAdminRooms(token) {
  return httpClient.get('/api/admin/rooms', authHeaders(token))
}

export function createAdminRoom(token, room) {
  return httpClient.post('/api/admin/rooms', room, authHeaders(token))
}

export function updateAdminRoom(token, id, updates) {
  return httpClient.patch(`/api/admin/rooms/${id}`, updates, authHeaders(token))
}

export function fetchAdminBookings(token) {
  return httpClient.get('/api/admin/bookings', authHeaders(token))
}
