import { httpClient } from './httpClient.js'

export function fetchRooms() {
  return httpClient.get('/api/rooms')
}
