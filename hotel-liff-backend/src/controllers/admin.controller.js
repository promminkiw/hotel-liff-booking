import jwt from 'jsonwebtoken'
import { timingSafeEqual } from 'crypto'
import { env } from '../config/env.js'
import { listAllRoomsForAdmin, createRoom, updateRoom } from '../services/rooms.service.js'
import { listAllBookingsForAdmin } from '../services/bookings.service.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ROOM_STATUSES = new Set(['active', 'maintenance', 'inactive'])

function passwordMatches(candidate) {
  const a = Buffer.from(candidate)
  const b = Buffer.from(env.adminPassword)
  // timingSafeEqual throws on length mismatch rather than just returning
  // false, and length itself is exactly the kind of thing a timing attack
  // could otherwise leak - pad instead of short-circuiting on length.
  if (a.length !== b.length) {
    return false
  }
  return timingSafeEqual(a, b)
}

export function postLogin(req, res) {
  const { password } = req.body
  if (!password || typeof password !== 'string' || !passwordMatches(password)) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' })
  }

  const token = jwt.sign({ role: 'admin' }, env.adminSecret, { expiresIn: '24h' })
  res.json({ token })
}

export async function getRooms(req, res, next) {
  try {
    res.json({ rooms: await listAllRoomsForAdmin() })
  } catch (err) {
    next(err)
  }
}

export async function postRoom(req, res, next) {
  try {
    const { roomNumber, roomType, name, description, pricePerNight, maxGuests, bedType, amenities, imageUrl } = req.body

    if (!roomNumber || !roomType || !name || !pricePerNight || !maxGuests) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน (ต้องมีเลขห้อง, ประเภท, ชื่อ, ราคา, จำนวนผู้เข้าพักสูงสุด)' })
    }

    const price = Number(pricePerNight)
    const guests = Number(maxGuests)
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'ราคาต่อคืนต้องเป็นตัวเลขมากกว่า 0' })
    }
    if (!Number.isInteger(guests) || guests <= 0) {
      return res.status(400).json({ error: 'จำนวนผู้เข้าพักสูงสุดต้องเป็นจำนวนเต็มมากกว่า 0' })
    }

    const room = await createRoom({
      room_number: roomNumber,
      room_type: roomType,
      name,
      description: description ?? null,
      price_per_night: price,
      max_guests: guests,
      bed_type: bedType ?? null,
      amenities: amenities ?? [],
      image_url: imageUrl ?? null,
      status: 'active',
    })

    res.status(201).json({ room })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'มีเลขห้องนี้อยู่แล้วในระบบ' })
    }
    next(err)
  }
}

export async function patchRoom(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ error: 'ไม่พบห้องนี้' })
    }

    const updates = {}

    if (req.body.pricePerNight !== undefined) {
      const price = Number(req.body.pricePerNight)
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: 'ราคาต่อคืนต้องเป็นตัวเลขมากกว่า 0' })
      }
      updates.price_per_night = price
    }

    if (req.body.status !== undefined) {
      if (!ROOM_STATUSES.has(req.body.status)) {
        return res.status(400).json({ error: `สถานะต้องเป็นหนึ่งใน: ${[...ROOM_STATUSES].join(', ')}` })
      }
      updates.status = req.body.status
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลที่จะแก้ไข' })
    }

    const room = await updateRoom(req.params.id, updates)
    if (!room) {
      return res.status(404).json({ error: 'ไม่พบห้องนี้' })
    }

    res.json({ room })
  } catch (err) {
    next(err)
  }
}

export async function getBookings(req, res, next) {
  try {
    res.json({ bookings: await listAllBookingsForAdmin() })
  } catch (err) {
    next(err)
  }
}
