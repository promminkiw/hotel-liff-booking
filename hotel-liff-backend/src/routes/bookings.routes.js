import { Router } from 'express'
import { postBooking, getBookings, patchCancelBooking } from '../controllers/bookings.controller.js'

const router = Router()

router.post('/', postBooking)
router.get('/', getBookings)
router.patch('/:id/cancel', patchCancelBooking)

export default router
