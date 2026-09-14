import { Router } from 'express'
import { verifyLineToken } from '../middleware/verifyLineToken.js'
import { postChat, getMessages } from '../controllers/ai.controller.js'

const router = Router()

router.use(verifyLineToken)
router.post('/chat', postChat)
router.get('/messages', getMessages)

export default router
