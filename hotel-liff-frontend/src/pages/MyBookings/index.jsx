import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyBookings, cancelBooking } from '../../api/bookingsApi.js'
import { useUser } from '../../context/UserContext.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  completed: 'เข้าพักเสร็จสิ้น',
}

const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed'])

export default function MyBookings() {
  const user = useUser()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelErrors, setCancelErrors] = useState({})

  function loadBookings() {
    setError(null)
    return fetchMyBookings(user.lineUserId)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadBookings()
  }, [user.lineUserId])

  async function handleCancel(bookingId) {
    setCancellingId(bookingId)
    setCancelErrors((prev) => ({ ...prev, [bookingId]: null }))
    try {
      await cancelBooking(bookingId, user.lineUserId)
      setConfirmingId(null)
      await loadBookings()
    } catch (err) {
      setCancelErrors((prev) => ({ ...prev, [bookingId]: err.message }))
    } finally {
      setCancellingId(null)
    }
  }

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
          {bookings.map((booking) => {
            const status = booking.displayStatus ?? booking.status
            const canCancel = CANCELLABLE_STATUSES.has(status)

            return (
              <li key={booking.id} className="booking-list-item">
                <div>
                  <strong>{booking.rooms?.name ?? booking.rooms?.room_type}</strong>
                  <p>
                    {formatDate(booking.check_in)} — {formatDate(booking.check_out)} · {booking.guests} คน
                  </p>
                  <p>รหัสการจอง: {booking.booking_code}</p>

                  {cancelErrors[booking.id] && <p className="error-text">{cancelErrors[booking.id]}</p>}

                  {canCancel && confirmingId !== booking.id && (
                    <button className="btn-link-danger" onClick={() => setConfirmingId(booking.id)}>
                      ยกเลิกการจอง
                    </button>
                  )}

                  {canCancel && confirmingId === booking.id && (
                    <div className="cancel-confirm">
                      <span>ยืนยันยกเลิกการจองนี้?</span>
                      <button
                        className="btn-link-danger"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยืนยัน'}
                      </button>
                      <button className="btn-link" onClick={() => setConfirmingId(null)}>
                        ไม่ยกเลิก
                      </button>
                    </div>
                  )}
                </div>
                <div className="booking-list-meta">
                  <span className={`status-badge status-${status}`}>{STATUS_LABELS[status] ?? status}</span>
                  <span>{formatCurrency(booking.total_price)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
