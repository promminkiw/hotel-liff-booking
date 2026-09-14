import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAdminBookings } from '../../api/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { formatDate } from '../../utils/formatDate.js'

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  completed: 'เข้าพักเสร็จสิ้น',
}

export default function AdminBookingList() {
  const { token, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdminBookings(token)
      .then((data) => setBookings(data.bookings))
      .catch((err) => {
        if (err.status === 401) {
          logout()
          navigate('/admin')
          return
        }
        setError(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>Admin — รายการจองทั้งหมด</h1>
        <Link to="/admin/rooms">กลับไปรายการห้อง</Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!error && !bookings && <p>กำลังโหลด...</p>}
      {bookings && bookings.length === 0 && <p>ยังไม่มีการจองในระบบ</p>}

      {bookings && bookings.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัสการจอง</th>
                <th>ผู้จอง</th>
                <th>ห้อง</th>
                <th>เช็คอิน</th>
                <th>เช็คเอาท์</th>
                <th>สถานะ</th>
                <th>ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const status = b.displayStatus ?? b.status
                return (
                  <tr key={b.id}>
                    <td>{b.booking_code}</td>
                    <td>{b.users?.display_name ?? '-'}</td>
                    <td>
                      {b.rooms?.name} ({b.rooms?.room_type})
                    </td>
                    <td>{formatDate(b.check_in)}</td>
                    <td>{formatDate(b.check_out)}</td>
                    <td>
                      <span className={`status-badge status-${status}`}>{STATUS_LABELS[status] ?? status}</span>
                    </td>
                    <td>{formatCurrency(b.total_price)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
