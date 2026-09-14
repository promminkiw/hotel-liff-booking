import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyBookings } from '../../api/bookingsApi.js'
import { useUser } from '../../context/UserContext.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  completed: 'เข้าพักเสร็จสิ้น',
}

export default function MyBookings() {
  const user = useUser()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyBookings(user.lineUserId)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
  }, [user.lineUserId])

  return (
    <section>
      <h1>การจองของฉัน</h1>

      {error && <p className="error-text">เกิดข้อผิดพลาด: {error}</p>}
      {!error && !bookings && <p>กำลังโหลด...</p>}
      {bookings && bookings.length === 0 && (
        <p>
          ยังไม่มีการจอง — <Link to="/rooms">ดูห้องพัก</Link>
        </p>
      )}

      {bookings && bookings.length > 0 && (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li key={booking.id} className="booking-list-item">
              <div>
                <strong>{booking.rooms?.name ?? booking.rooms?.room_type}</strong>
                <p>
                  {formatDate(booking.check_in)} — {formatDate(booking.check_out)} · {booking.guests} คน
                </p>
                <p>รหัสการจอง: {booking.booking_code}</p>
              </div>
              <div className="booking-list-meta">
                <span className={`status-badge status-${booking.status}`}>
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
                <span>{formatCurrency(booking.total_price)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
