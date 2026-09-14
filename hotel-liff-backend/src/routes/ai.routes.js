import { Router } from 'express'
import { verifyLineToken } from '../middleware/verifyLineToken.js'
import { aiRateLimiter } from '../middleware/rateLimiter.js'
import { postChat, getMessages } from '../controllers/ai.controller.js'

const router = Router()

router.use(verifyLineToken)
router.use(aiRateLimiter)
router.post('/chat', postChat)
router.get('/messages', getMessages)

export default router
