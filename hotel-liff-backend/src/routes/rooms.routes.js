import { Router } from 'express'
import { getRooms, getRoom } from '../controllers/rooms.controller.js'

const router = Router()

router.get('/', getRooms)
router.get('/:id', getRoom)

export default router
