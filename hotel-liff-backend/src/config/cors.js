import { env } from './env.js'

export const corsOptions = {
  origin: env.allowedOrigin,
  credentials: true,
}
