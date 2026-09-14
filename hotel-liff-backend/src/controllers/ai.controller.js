import { sendChatMessage, getConversationHistory } from '../services/gemini/chatService.js'

// A generous cap for a chat message, well beyond anything a real user would
// type or speak - exists to stop one request from ballooning token cost
// (and the shared Gemini free-tier quota, see Phase 13/14) rather than to
// restrict legitimate use.
const MAX_MESSAGE_LENGTH = 2000

export async function postChat(req, res, next) {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความ' })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `ข้อความยาวเกินไป (สูงสุด ${MAX_MESSAGE_LENGTH} ตัวอักษร)` })
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
