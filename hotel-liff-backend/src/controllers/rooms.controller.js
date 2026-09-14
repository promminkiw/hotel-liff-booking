import { listRooms, getRoomById } from '../services/rooms.service.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
