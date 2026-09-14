import { createSupabaseClient } from '../../config/supabaseClient.js'
import { findOrCreateUser } from '../users.service.js'
import { getHotelInfo } from '../hotelInfo.service.js'
import { GEMINI_MODEL, generateContentWithRetry } from './geminiClient.js'
import { buildSystemPrompt } from './systemPrompt.js'

// How many past messages get sent back to Gemini as context on every turn -
// caps token cost per request regardless of how long the conversation has
// grown in the database.
const MAX_HISTORY_MESSAGES = 20

// DB stores 'assistant' (matches the ai_messages role check constraint);
// Gemini's contents array expects 'model' instead.
function toGeminiRole(dbRole) {
  return dbRole === 'assistant' ? 'model' : 'user'
}

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

  const response = await generateContentWithRetry({
    model: GEMINI_MODEL,
    contents: [
      ...history.map((m) => ({ role: toGeminiRole(m.role), parts: [{ text: m.content }] })),
      { role: 'user', parts: [{ text: message }] },
    ],
    config: {
      systemInstruction: systemPrompt,
    },
  })

  const replyText = response.text

  await saveMessage(supabase, conversationId, 'assistant', replyText)

  return replyText
}
