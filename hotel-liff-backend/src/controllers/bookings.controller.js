import { createBooking, listBookingsByUser } from '../services/bookings.service.js'

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
