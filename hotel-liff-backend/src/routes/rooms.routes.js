import { Router } from 'express'
import {
  getRooms,
  getRoom,
  postCheckAvailability,
  getAvailabilityCalendarHandler,
} from '../controllers/rooms.controller.js'

const router = Router()

router.get('/', getRooms)
router.post('/check-availability', postCheckAvailability)
router.get('/availability-calendar', getAvailabilityCalendarHandler)
router.get('/:id', getRoom)

export default router
