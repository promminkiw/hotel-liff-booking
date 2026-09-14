import { GoogleGenAI } from '@google/genai'
import { env } from '../../config/env.js'

export const GEMINI_MODEL = 'gemini-flash-latest'

let client = null

export function getGeminiClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey })
  }
  return client
}

const RETRYABLE_STATUS = new Set([429, 503])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 429 on the free tier is a per-minute request quota (observed: 5
// requests/minute/model), not a momentary blip like 503 - a short fixed
// backoff isn't enough, so honor the server's suggested retryDelay when
// present and fall back to a multi-second wait otherwise.
function getRetryDelayMs(err, attempt) {
  if (err.status === 429) {
    try {
      const parsed = JSON.parse(err.message)
      const retryInfo = parsed?.error?.details?.find((d) => d['@type']?.includes('RetryInfo'))
      const seconds = parseFloat(retryInfo?.retryDelay ?? '')
      if (!Number.isNaN(seconds) && seconds > 0) {
        return Math.min(seconds * 1000 + 500, 10000)
      }
    } catch {
      // fall through to the default below
    }
    return 4000 * (attempt + 1)
  }
  return 500 * (attempt + 1)
}

export async function generateContentWithRetry(params, maxRetries = 2) {
  const gemini = getGeminiClient()
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await gemini.models.generateContent(params)
    } catch (err) {
      lastError = err
      if (!RETRYABLE_STATUS.has(err.status) || attempt === maxRetries) {
        throw err
      }
      await sleep(getRetryDelayMs(err, attempt))
    }
  }

  throw lastError
}
