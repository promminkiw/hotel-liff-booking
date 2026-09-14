import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyBookings, cancelBooking } from '../../api/bookingsApi.js'
import { useUser } from '../../context/UserContext.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDate.js'
import LoginPrompt from '../../components/common/LoginPrompt.jsx'
import Loading from '../../components/common/Loading.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  completed: 'เข้าพักเสร็จสิ้น',
}

const CANCELLABLE_STATUSES = new Set(['pending', 'confirmed'])

export default function MyBookings() {
  const { profile, idToken, loading: userLoading, login } = useUser()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelErrors, setCancelErrors] = useState({})

  function loadBookings() {
    setError(null)
    return fetchMyBookings(idToken)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err))
  }

  useEffect(() => {
    if (profile) loadBookings()
  }, [profile, idToken])

  async function handleCancel(bookingId) {
    setCancellingId(bookingId)
    setCancelErrors((prev) => ({ ...prev, [bookingId]: null }))
    try {
      await cancelBooking(bookingId, idToken)
      setConfirmingId(null)
      await loadBookings()
    } catch (err) {
      setCancelErrors((prev) => ({ ...prev, [bookingId]: err }))
    } finally {
      setCancellingId(null)
    }
  }

  if (userLoading) {
    return <Loading />
  }

  if (!profile) {
    return <LoginPrompt onLogin={login} message="เข้าสู่ระบบด้วย LINE เพื่อดูการจองของคุณ" />
  }

  return (
    <section>
      <h1>การจองของฉัน</h1>

      {error && error.status === 401 && <LoginPrompt onLogin={login} message="เซสชัน LINE หมดอายุ กรุณาเข้าสู่ระบบใหม่" />}
      {error && error.status !== 401 && <ErrorState message={`เกิดข้อผิดพลาด: ${error.message}`} />}
      {!error && !bookings && <Loading />}
      {bookings && bookings.length === 0 && (
        <EmptyState>
          ยังไม่มีการจอง — <Link to="/rooms">ดูห้องพัก</Link>
        </EmptyState>
      )}

      {bookings && bookings.length > 0 && (
        <ul className="booking-list">
          {bookings.map((booking) => {
            const status = booking.displayStatus ?? booking.status
            const canCancel = CANCELLABLE_STATUSES.has(status)
            const cancelError = cancelErrors[booking.id]

            return (
              <li key={booking.id} className="booking-list-item">
                <div>
                  <strong>{booking.rooms?.name ?? booking.rooms?.room_type}</strong>
                  <p>
                    {formatDate(booking.check_in)} — {formatDate(booking.check_out)} · {booking.guests} คน
                  </p>
                  <p>รหัสการจอง: {booking.booking_code}</p>

                  {cancelError && cancelError.status === 401 && (
                    <LoginPrompt onLogin={login} message="เซสชัน LINE หมดอายุ กรุณาเข้าสู่ระบบใหม่" />
                  )}
                  {cancelError && cancelError.status !== 401 && <ErrorState message={cancelError.message} />}

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
