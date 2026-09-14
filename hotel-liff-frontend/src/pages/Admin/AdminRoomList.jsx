import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAdminRooms, updateAdminRoom } from '../../api/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const STATUS_OPTIONS = ['active', 'maintenance', 'inactive']

export default function AdminRoomList() {
  const { token, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState(null)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)

  function load() {
    fetchAdminRooms(token)
      .then((data) => setRooms(data.rooms))
      .catch((err) => handleError(err))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleError(err) {
    if (err.status === 401) {
      logout()
      navigate('/admin')
      return
    }
    setError(err.message)
  }

  async function handlePriceChange(room, newPrice) {
    const price = Number(newPrice)
    if (!price || price === room.price_per_night) return
    setSavingId(room.id)
    try {
      await updateAdminRoom(token, room.id, { pricePerNight: price })
      load()
    } catch (err) {
      handleError(err)
    } finally {
      setSavingId(null)
    }
  }

  async function handleStatusChange(room, newStatus) {
    setSavingId(room.id)
    try {
      await updateAdminRoom(token, room.id, { status: newStatus })
      load()
    } catch (err) {
      handleError(err)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>Admin — รายการห้องพัก</h1>
        <div className="admin-nav-links">
          <Link to="/admin/rooms/new" className="btn-primary">
            + เพิ่มห้องใหม่
          </Link>
          <Link to="/admin/bookings">ดู Booking ทั้งหมด</Link>
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              logout()
              navigate('/admin')
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!rooms && <p>กำลังโหลด...</p>}

      {rooms && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>เลขห้อง</th>
                <th>ประเภท</th>
                <th>ชื่อ</th>
                <th>ราคา/คืน</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>{room.name}</td>
                  <td>
                    <input
                      type="number"
                      defaultValue={room.price_per_night}
                      disabled={savingId === room.id}
                      onBlur={(e) => handlePriceChange(room, e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={room.status}
                      disabled={savingId === room.id}
                      onChange={(e) => handleStatusChange(room, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-table-note">ราคา: แก้แล้วคลิกออกจากช่องเพื่อบันทึก · สถานะ: บันทึกทันทีที่เลือก — {rooms.length} ห้องทั้งหมด</p>
        </div>
      )}
    </section>
  )
}
