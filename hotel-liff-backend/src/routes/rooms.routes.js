import { Router } from 'express'
import { getRooms, getRoom, postCheckAvailability } from '../controllers/rooms.controller.js'

const router = Router()

router.get('/', getRooms)
router.post('/check-availability', postCheckAvailability)
router.get('/:id', getRoom)

export default router
