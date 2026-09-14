import { listRooms, getRoomById, checkRoomTypeAvailability, getAvailabilityCalendar } from '../services/rooms.service.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MONTH_RE = /^\d{4}-\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function getRooms(req, res, next) {
  try {
    const { room_type: roomType, guests } = req.query
    const rooms = await listRooms({
      roomType: roomType || undefined,
      guests: guests ? Number(guests) : undefined,
    })
    res.json({ rooms })
  } catch (err) {
    next(err)
  }
}

export async function getRoom(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ error: 'ไม่พบห้องพักนี้' })
    }
    const room = await getRoomById(req.params.id)
    if (!room) {
      return res.status(404).json({ error: 'ไม่พบห้องพักนี้' })
    }
    res.json({ room })
  } catch (err) {
    next(err)
  }
}

export async function postCheckAvailability(req, res, next) {
  try {
    const { roomType, checkIn, checkOut, guests } = req.body
    if (!roomType || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' })
    }
    if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
      return res.status(400).json({ error: 'รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)' })
    }
    const result = await checkRoomTypeAvailability({ roomType, checkIn, checkOut, guests: Number(guests) })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getAvailabilityCalendarHandler(req, res, next) {
  try {
    const { room_type: roomType, month } = req.query
    if (!roomType || !month || !MONTH_RE.test(month)) {
      return res.status(400).json({ error: 'ต้องระบุ room_type และ month (YYYY-MM)' })
    }
    const result = await getAvailabilityCalendar({ roomType, month })
    res.json(result)
  } catch (err) {
    next(err)
  }
}
