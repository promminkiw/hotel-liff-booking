import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchRoomById } from '../../api/roomsApi.js'
import { checkAvailability, createBooking } from '../../api/bookingsApi.js'
import { useUser } from '../../context/UserContext.jsx'
import { todayInBangkok } from '../../utils/dateTz.js'
import { generateIdempotencyKey } from '../../utils/idempotency.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { ROOM_TYPES } from '../../utils/roomTypes.js'

export default function Booking() {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('roomId')
  const user = useUser()
  const navigate = useNavigate()

  const [lockedRoom, setLockedRoom] = useState(null)
  const [roomType, setRoomType] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  const [availability, setAvailability] = useState(null)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const today = todayInBangkok()

  useEffect(() => {
    if (!roomId) return
    fetchRoomById(roomId)
      .then((data) => {
        setLockedRoom(data.room)
        setRoomType(data.room.room_type)
      })
      .catch(() => {
        // if the room lookup fails, fall back to manual room-type selection
        setLockedRoom(null)
      })
  }, [roomId])

  // A fresh idempotency key per distinct booking attempt: changing any of
  // the booking parameters means a new attempt, so it must not reuse a key
  // from a previous (possibly failed, possibly successful) attempt.
  const idempotencyKey = useMemo(
    () => generateIdempotencyKey(),
    [roomType, checkIn, checkOut, guests],
  )

  function resetAvailability() {
    setAvailability(null)
    setCheckError(null)
    setConfirmedBooking(null)
  }

  async function handleCheckAvailability(e) {
    e.preventDefault()
    setCheckError(null)
    setAvailability(null)

    if (!roomType || !checkIn || !checkOut) {
      setCheckError('กรุณาเลือกประเภทห้องและวันที่ให้ครบ')
      return
    }

    setChecking(true)
    try {
      const result = await checkAvailability({ roomType, checkIn, checkOut, guests: Number(guests) })
      setAvailability(result)
    } catch (err) {
      setCheckError(err.message)
    } finally {
      setChecking(false)
    }
  }

  async function handleConfirmBooking() {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const { booking } = await createBooking({
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        roomType,
        checkIn,
        checkOut,
        guests: Number(guests),
        idempotencyKey,
      })
      setConfirmedBooking(booking)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmedBooking) {
    return (
      <section>
        <h1>จองสำเร็จ</h1>
        <p>รหัสการจอง: {confirmedBooking.booking_code}</p>
        <p>
          เช็คอิน {confirmedBooking.check_in} — เช็คเอาท์ {confirmedBooking.check_out}
        </p>
        <p>ยอดรวม {formatCurrency(confirmedBooking.total_price)}</p>
        <button className="btn-primary" onClick={() => navigate('/my-bookings')}>
          ดูการจองของฉัน
        </button>
      </section>
    )
  }

  return (
    <section>
      <h1>จองห้องพัก</h1>

      <form className="booking-form" onSubmit={handleCheckAvailability}>
        <label>
          ประเภทห้อง
          {lockedRoom ? (
            <input type="text" value={`${lockedRoom.name} (${lockedRoom.room_type})`} disabled />
          ) : (
            <select
              value={roomType}
              onChange={(e) => {
                setRoomType(e.target.value)
                resetAvailability()
              }}
              required
            >
              <option value="">เลือกประเภทห้อง</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          วันเช็คอิน
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value)
              resetAvailability()
            }}
            required
          />
        </label>

        <label>
          วันเช็คเอาท์
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value)
              resetAvailability()
            }}
            required
          />
        </label>

        <label>
          จำนวนผู้เข้าพัก
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => {
              setGuests(e.target.value)
              resetAvailability()
            }}
            required
          />
        </label>

        <button type="submit" className="btn-primary" disabled={checking}>
          {checking ? 'กำลังตรวจสอบ...' : 'เช็คห้องว่าง'}
        </button>
      </form>

      {checkError && <p className="error-text">{checkError}</p>}

      {availability && (
        <div className="availability-result">
          {availability.available ? (
            <>
              <p>
                ห้องว่าง {availability.count} ห้อง — เริ่มต้น {formatCurrency(availability.pricePerNight)} / คืน
              </p>
              <button className="btn-primary" onClick={handleConfirmBooking} disabled={submitting}>
                {submitting ? 'กำลังยืนยัน...' : 'ยืนยันการจอง'}
              </button>
            </>
          ) : (
            <p className="error-text">ขออภัยครับ ไม่มีห้องว่างในช่วงวันที่เลือก</p>
          )}
        </div>
      )}

      {submitError && <p className="error-text">{submitError}</p>}
    </section>
  )
}
