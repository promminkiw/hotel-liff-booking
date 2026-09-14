import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createAdminRoom } from '../../api/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { ROOM_TYPES } from '../../utils/roomTypes.js'

const initialForm = {
  roomNumber: '',
  roomType: ROOM_TYPES[0],
  name: '',
  description: '',
  pricePerNight: '',
  maxGuests: '',
  bedType: '',
}

export default function AdminRoomCreate() {
  const { token, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createAdminRoom(token, {
        roomNumber: form.roomNumber,
        roomType: form.roomType,
        name: form.name,
        description: form.description || undefined,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        bedType: form.bedType || undefined,
      })
      navigate('/admin/rooms')
    } catch (err) {
      if (err.status === 401) {
        logout()
        navigate('/admin')
        return
      }
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>Admin — เพิ่มห้องใหม่</h1>
        <Link to="/admin/rooms">กลับไปรายการห้อง</Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          เลขห้อง
          <input value={form.roomNumber} onChange={(e) => update('roomNumber', e.target.value)} required />
        </label>

        <label>
          ประเภทห้อง
          <select value={form.roomType} onChange={(e) => update('roomType', e.target.value)}>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          ชื่อห้อง
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </label>

        <label>
          รายละเอียด
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
        </label>

        <label>
          ราคา/คืน (บาท)
          <input
            type="number"
            min="0"
            value={form.pricePerNight}
            onChange={(e) => update('pricePerNight', e.target.value)}
            required
          />
        </label>

        <label>
          จำนวนผู้เข้าพักสูงสุด
          <input
            type="number"
            min="1"
            value={form.maxGuests}
            onChange={(e) => update('maxGuests', e.target.value)}
            required
          />
        </label>

        <label>
          ประเภทเตียง
          <input value={form.bedType} onChange={(e) => update('bedType', e.target.value)} placeholder="เช่น King, Queen" />
        </label>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : 'เพิ่มห้อง'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
    </section>
  )
}
