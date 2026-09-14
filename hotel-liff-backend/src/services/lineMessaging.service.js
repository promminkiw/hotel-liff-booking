import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

const PUSH_URL = 'https://api.line.me/v2/bot/message/push'

// Best-effort only: a push notification failing (user hasn't added the
// official account as a friend, rate limit, network blip, ...) must never
// fail the booking/cancellation itself, so this never throws - it logs and
// returns.
export async function sendPushMessage(lineUserId, text) {
  try {
    const res = await fetch(PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.lineMessagingAccessToken}`,
      },
      body: JSON.stringify({ to: lineUserId, messages: [{ type: 'text', text }] }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.warn(`LINE push message failed (${res.status}): ${body}`)
    }
  } catch (err) {
    logger.warn('LINE push message failed', err)
  }
}
