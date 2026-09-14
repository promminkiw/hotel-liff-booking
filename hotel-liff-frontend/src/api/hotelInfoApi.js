import { httpClient } from './httpClient.js'

export function fetchHotelInfo() {
  return httpClient.get('/api/hotel-info')
}
