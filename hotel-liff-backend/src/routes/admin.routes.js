import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { verifyAdminToken } from '../middleware/verifyAdminToken.js'
import { postLogin, getRooms, postRoom, patchRoom, getBookings } from '../controllers/admin.controller.js'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'พยายามเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' },
})

router.post('/login', loginLimiter, postLogin)

router.use(verifyAdminToken)
router.get('/rooms', getRooms)
router.post('/rooms', postRoom)
router.patch('/rooms/:id', patchRoom)
router.get('/bookings', getBookings)

export default router
