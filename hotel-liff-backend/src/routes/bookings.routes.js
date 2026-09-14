import { Router } from 'express'
import { postBooking, getBookings } from '../controllers/bookings.controller.js'

const router = Router()

router.post('/', postBooking)
router.get('/', getBookings)

export default router
