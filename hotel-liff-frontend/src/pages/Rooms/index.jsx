import { useEffect, useState } from 'react'
import { fetchRooms } from '../../api/roomsApi.js'

export default function Rooms() {
  const [rooms, setRooms] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRooms()
      .then((data) => setRooms(data.rooms))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section>
      <h1>ห้องพัก</h1>
      {error && <p>เกิดข้อผิดพลาด: {error}</p>}
      {!error && !rooms && <p>กำลังโหลด...</p>}
      {rooms && (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              {room.name} ({room.room_type}) — {room.price_per_night} บาท/คืน — พักได้สูงสุด {room.max_guests} คน
            </li>
          ))}
        </ul>
      )}
      <p>รายการห้องแบบเต็มรูปแบบ (filter, รูปภาพ, การ์ด) จะถูกเพิ่มใน Phase 6</p>
    </section>
  )
}
