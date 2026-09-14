import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify'

// Every request that reads or writes a user's own booking data must carry
// a LINE ID token that gets verified against LINE's own API on every call
// - never trust a lineUserId the client just hands us in the body/query,
// since that's trivially forgeable. On success, req.lineUser is the only
// source of truth controllers use for "who is making this request".
export async function verifyLineToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนใช้งาน' })
  }

  const idToken = authHeader.slice('Bearer '.length)

  try {
    const params = new URLSearchParams({ id_token: idToken, client_id: env.lineChannelId })
    const response = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) {
      return res.status(401).json({ error: 'เซสชัน LINE หมดอายุ กรุณาเข้าสู่ระบบใหม่' })
    }

    const payload = await response.json()
    req.lineUser = {
      lineUserId: payload.sub,
      displayName: payload.name ?? null,
      pictureUrl: payload.picture ?? null,
    }
    next()
  } catch (err) {
    logger.error('verifyLineToken failed', err)
    next(err)
  }
}
