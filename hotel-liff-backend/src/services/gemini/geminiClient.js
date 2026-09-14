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

// The free tier occasionally returns 503 "high demand" or 429 rate-limit
// errors that clear up within a second or two - worth a couple of quick
// retries before surfacing an error to the user.
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
      await sleep(500 * (attempt + 1))
    }
  }

  throw lastError
}
