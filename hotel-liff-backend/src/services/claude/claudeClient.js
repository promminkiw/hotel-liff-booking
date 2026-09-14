import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env.js'

export const CLAUDE_MODEL = 'claude-sonnet-5'

let client = null

export function getClaudeClient() {
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey })
  }
  return client
}
