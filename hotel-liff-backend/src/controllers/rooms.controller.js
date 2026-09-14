import { listRooms } from '../services/rooms.service.js'

export async function getRooms(req, res, next) {
  try {
    const rooms = await listRooms()
    res.json({ rooms })
  } catch (err) {
    next(err)
  }
}
