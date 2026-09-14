import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// Completely separate from LINE auth - admins reach this from a plain
// browser, not the LINE app, so there's no LIFF/ID-token involved at all.
export function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ admin ก่อน' })
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    jwt.verify(token, env.adminSecret)
    next()
  } catch {
    return res.status(401).json({ error: 'เซสชัน admin หมดอายุ กรุณาเข้าสู่ระบบใหม่' })
  }
}
