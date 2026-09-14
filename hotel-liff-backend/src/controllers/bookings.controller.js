import { createBooking, listBookingsByUser, cancelBooking } from '../services/bookings.service.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function postBooking(req, res, next) {
  try {
    const { roomType, checkIn, checkOut, guests, idempotencyKey } = req.body
    const { lineUserId, displayName } = req.lineUser

    if (!roomType || !checkIn || !checkOut || !guests) {
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
    const bookings = await listBookingsByUser(req.lineUser.lineUserId)
    res.json({ bookings })
  } catch (err) {
    next(err)
  }
}

export async function patchCancelBooking(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ error: 'ไม่พบการจองนี้' })
    }

    const booking = await cancelBooking({ bookingId: req.params.id, lineUserId: req.lineUser.lineUserId })
    res.json({ booking })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message })
    }
    next(err)
  }
}
