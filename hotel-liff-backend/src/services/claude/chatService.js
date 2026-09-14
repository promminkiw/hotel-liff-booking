import { createSupabaseClient } from '../../config/supabaseClient.js'
import { findOrCreateUser } from '../users.service.js'
import { getHotelInfo } from '../hotelInfo.service.js'
import { getClaudeClient, CLAUDE_MODEL } from './claudeClient.js'
import { buildSystemPrompt } from './systemPrompt.js'

// How many past messages get sent back to Claude as context on every turn -
// caps token cost per request regardless of how long the conversation has
// grown in the database.
const MAX_HISTORY_MESSAGES = 20

async function getOrCreateConversation(supabase, userId) {
  const { data: existing, error: findError } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing.id

  const { data: created, error: createError } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (createError) throw createError
  return created.id
}

async function loadRecentMessages(supabase, conversationId) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY_MESSAGES)

  if (error) throw error
  return data.reverse()
}

async function saveMessage(supabase, conversationId, role, content) {
  const { error } = await supabase.from('ai_messages').insert({ conversation_id: conversationId, role, content })
  if (error) throw error
}

export async function getConversationHistory({ lineUserId, displayName }) {
  const supabase = createSupabaseClient()
  const userId = await findOrCreateUser(lineUserId, displayName)
  const conversationId = await getOrCreateConversation(supabase, userId)
  return loadRecentMessages(supabase, conversationId)
}

export async function sendChatMessage({ lineUserId, displayName, message }) {
  const supabase = createSupabaseClient()
  const userId = await findOrCreateUser(lineUserId, displayName)
  const conversationId = await getOrCreateConversation(supabase, userId)

  const history = await loadRecentMessages(supabase, conversationId)
  await saveMessage(supabase, conversationId, 'user', message)

  const hotelInfo = await getHotelInfo()
  const systemPrompt = buildSystemPrompt(hotelInfo)

  const claude = getClaudeClient()
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
  })

  const replyText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  await saveMessage(supabase, conversationId, 'assistant', replyText)

  return replyText
}
