import { useEffect, useState } from 'react'
import { fetchRooms } from '../../api/roomsApi.js'
import RoomCard from '../../components/room/RoomCard.jsx'
import RoomFilter from '../../components/room/RoomFilter.jsx'
import Loading from '../../components/common/Loading.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

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

      {error && <ErrorState message={`เกิดข้อผิดพลาด: ${error}`} />}
      {!error && !rooms && <Loading />}
      {!error && rooms && rooms.length === 0 && <EmptyState>ไม่พบห้องพักที่ตรงกับเงื่อนไข</EmptyState>}

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
