import { sendChatMessage, getConversationHistory } from '../services/gemini/chatService.js'

export async function postChat(req, res, next) {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความ' })
    }

    const reply = await sendChatMessage({
      lineUserId: req.lineUser.lineUserId,
      displayName: req.lineUser.displayName,
      message: message.trim(),
    })

    res.json({ reply })
  } catch (err) {
    next(err)
  }
}

export async function getMessages(req, res, next) {
  try {
    const messages = await getConversationHistory({
      lineUserId: req.lineUser.lineUserId,
      displayName: req.lineUser.displayName,
    })
    res.json({ messages })
  } catch (err) {
    next(err)
  }
}
