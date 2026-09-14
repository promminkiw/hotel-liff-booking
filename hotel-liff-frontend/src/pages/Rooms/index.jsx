import { useEffect, useState } from 'react'
import { fetchRooms } from '../../api/roomsApi.js'
import RoomCard from '../../components/room/RoomCard.jsx'
import RoomFilter from '../../components/room/RoomFilter.jsx'

export default function Rooms() {
  const [filters, setFilters] = useState({ roomType: '', guests: '' })
  const [rooms, setRooms] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
    fetchRooms(filters)
      .then((data) => setRooms(data.rooms))
      .catch((err) => setError(err.message))
  }, [filters.roomType, filters.guests])

  return (
    <section>
      <h1>ห้องพัก</h1>
      <RoomFilter roomType={filters.roomType} guests={filters.guests} onChange={setFilters} />

      {error && <p className="error-text">เกิดข้อผิดพลาด: {error}</p>}
      {!error && !rooms && <p>กำลังโหลด...</p>}
      {!error && rooms && rooms.length === 0 && <p>ไม่พบห้องพักที่ตรงกับเงื่อนไข</p>}

      {rooms && rooms.length > 0 && (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  )
}
