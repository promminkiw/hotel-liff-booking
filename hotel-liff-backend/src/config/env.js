import 'dotenv/config'

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ALLOWED_ORIGIN',
  'LINE_CHANNEL_ID',
  'LINE_CHANNEL_SECRET',
  'LINE_MESSAGING_ACCESS_TOKEN',
  'GEMINI_API_KEY',
]

const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}`)
  process.exit(1)
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  allowedOrigin: process.env.ALLOWED_ORIGIN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  lineChannelId: process.env.LINE_CHANNEL_ID,
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET,
  lineMessagingAccessToken: process.env.LINE_MESSAGING_ACCESS_TOKEN,
  geminiApiKey: process.env.GEMINI_API_KEY,
}
