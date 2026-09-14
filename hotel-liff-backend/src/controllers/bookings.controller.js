import { createBooking, listBookingsByUser, cancelBooking } from '../services/bookings.service.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function postBooking(req, res, next) {
  try {
    const { lineUserId, displayName, roomType, checkIn, checkOut, guests, idempotencyKey } = req.body

    if (!lineUserId || !roomType || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' })
    }

    const booking = await createBooking({
      lineUserId,
      displayName,
      roomType,
      checkIn,
      checkOut,
      guests: Number(guests),
      idempotencyKey,
    })

    res.status(201).json({ booking })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    next(err)
  }
}

export async function getBookings(req, res, next) {
  try {
    const { lineUserId } = req.query
    if (!lineUserId) {
      return res.status(400).json({ error: 'ต้องระบุ lineUserId' })
    }
    const bookings = await listBookingsByUser(lineUserId)
    res.json({ bookings })
  } catch (err) {
    next(err)
  }
}

export async function patchCancelBooking(req, res, next) {
  try {
    const { lineUserId } = req.body
    if (!lineUserId) {
      return res.status(400).json({ error: 'ต้องระบุ lineUserId' })
    }
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ error: 'ไม่พบการจองนี้' })
    }

    const booking = await cancelBooking({ bookingId: req.params.id, lineUserId })
    res.json({ booking })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    next(err)
  }
}
