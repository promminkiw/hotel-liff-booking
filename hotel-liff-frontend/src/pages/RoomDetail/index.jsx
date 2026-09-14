import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchRoomById } from '../../api/roomsApi.js'
import { formatCurrency } from '../../utils/formatCurrency.js'

export default function RoomDetail() {
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setRoom(null)
    setError(null)
    fetchRoomById(roomId)
      .then((data) => setRoom(data.room))
      .catch((err) => setError(err.message))
  }, [roomId])

  if (error) return <p className="error-text">เกิดข้อผิดพลาด: {error}</p>
  if (!room) return <p>กำลังโหลด...</p>

  return (
    <section className="room-detail">
      <Link to="/rooms" className="back-link">
        ← กลับไปหน้ารายการห้อง
      </Link>

      <div className="room-detail-image">
        {room.image_url ? (
          <img src={room.image_url} alt={room.name} />
        ) : (
          <div className="room-card-image-placeholder">ไม่มีรูปภาพ</div>
        )}
      </div>

      <span className="room-card-type">{room.room_type}</span>
      <h1>{room.name}</h1>
      <p>{room.description}</p>

      <ul className="room-detail-facts">
        <li>เลขห้อง: {room.room_number}</li>
        <li>พักได้สูงสุด: {room.max_guests} คน</li>
        <li>ประเภทเตียง: {room.bed_type}</li>
        <li>ราคา: {formatCurrency(room.price_per_night)} / คืน</li>
      </ul>

      {room.amenities?.length > 0 && (
        <>
          <h2>สิ่งอำนวยความสะดวก</h2>
          <ul className="room-detail-amenities">
            {room.amenities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <Link to={`/booking?roomId=${room.id}`} className="btn-primary">
        จองห้องนี้
      </Link>
    </section>
  )
}
