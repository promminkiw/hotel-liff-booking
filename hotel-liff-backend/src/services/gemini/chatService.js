import { createSupabaseClient } from '../../config/supabaseClient.js'
import { findOrCreateUser } from '../users.service.js'
import { getHotelInfo } from '../hotelInfo.service.js'
import { GEMINI_MODEL, generateContentWithRetry } from './geminiClient.js'
import { buildSystemPrompt } from './systemPrompt.js'
import { toolSchemas } from './toolSchemas.js'
import { executeTool } from './toolExecutor.js'

// How many past messages get sent back to Gemini as context on every turn -
// caps request size regardless of how long the conversation has grown in
// the database.
const MAX_HISTORY_MESSAGES = 20

// Guardrail against the AI (or a chain of confusing tool results) looping
// forever: at most this many tool-call rounds per user message before we
// force a stop and answer with whatever we have.
const MAX_TOOL_ROUNDS = 5

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

// role/content only - tool-call bookkeeping rows (content is null) are
// replayed as plain text turns, so they're skipped when rebuilding context.
async function saveMessage(supabase, conversationId, { role, content = null, toolName = null, toolInput = null, toolResult = null }) {
  const { error } = await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    tool_name: toolName,
    tool_input: toolInput,
    tool_result: toolResult,
  })
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
  await saveMessage(supabase, conversationId, { role: 'user', content: message })

  const hotelInfo = await getHotelInfo()
  const systemPrompt = buildSystemPrompt(hotelInfo)
  const toolContext = { lineUserId, displayName }

  const contents = [
    ...history.filter((m) => m.content !== null).map((m) => ({ role: toGeminiRole(m.role), parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: message }] },
  ]

  let finalText = ''

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: toolSchemas }],
      },
    })

    const parts = response.candidates?.[0]?.content?.parts ?? []
    const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall)

    if (functionCalls.length === 0) {
      finalText = response.text ?? ''
      break
    }

    contents.push({ role: 'model', parts })

    const responseParts = []
    for (const call of functionCalls) {
      const args = call.args ?? {}
      let result
      try {
        result = await executeTool(call.name, args, toolContext)
      } catch (err) {
        result = { error: err.message }
      }

      await saveMessage(supabase, conversationId, { role: 'assistant', toolName: call.name, toolInput: args })
      await saveMessage(supabase, conversationId, { role: 'tool', toolName: call.name, toolResult: result })

      responseParts.push({ functionResponse: { name: call.name, response: result } })
    }

    contents.push({ role: 'user', parts: responseParts })
  }

  if (!finalText) {
    finalText = 'ขออภัยครับ ตอนนี้ผมดำเนินการให้ไม่สำเร็จ กรุณาลองใหม่อีกครั้งหรือติดต่อโรงแรมโดยตรง'
  }

  await saveMessage(supabase, conversationId, { role: 'assistant', content: finalText })

  return finalText
}
