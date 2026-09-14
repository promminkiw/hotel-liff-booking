import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency.js'

export default function RoomCard({ room }) {
  return (
    <Link to={`/rooms/${room.id}`} className="room-card">
      <div className="room-card-image">
        {room.image_url ? (
          <img src={room.image_url} alt={room.name} />
        ) : (
          <div className="room-card-image-placeholder">ไม่มีรูปภาพ</div>
        )}
      </div>
      <div className="room-card-body">
        <span className="room-card-type">{room.room_type}</span>
        <h3>{room.name}</h3>
        <p className="room-card-desc">{room.description}</p>
        <div className="room-card-meta">
          <span>พักได้สูงสุด {room.max_guests} คน</span>
          <span className="room-card-price">{formatCurrency(room.price_per_night)} / คืน</span>
        </div>
      </div>
    </Link>
  )
}
