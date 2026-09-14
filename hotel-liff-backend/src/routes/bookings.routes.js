import { Router } from 'express'
import { verifyLineToken } from '../middleware/verifyLineToken.js'
import { postBooking, getBookings, patchCancelBooking } from '../controllers/bookings.controller.js'

const router = Router()

router.use(verifyLineToken)
router.post('/', postBooking)
router.get('/', getBookings)
router.patch('/:id/cancel', patchCancelBooking)

export default router
