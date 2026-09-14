import { httpClient } from './httpClient.js'

export function fetchRooms({ roomType, guests } = {}) {
  const params = new URLSearchParams()
  if (roomType) params.set('room_type', roomType)
  if (guests) params.set('guests', guests)
  const query = params.toString()
  return httpClient.get(`/api/rooms${query ? `?${query}` : ''}`)
}

export function fetchRoomById(id) {
  return httpClient.get(`/api/rooms/${id}`)
}
