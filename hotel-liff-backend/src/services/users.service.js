import { createSupabaseClient } from '../config/supabaseClient.js'

export async function findOrCreateUser(lineUserId, displayName) {
  const supabase = createSupabaseClient()

  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing.id

  const { data: created, error: createError } = await supabase
    .from('users')
    .insert({ line_user_id: lineUserId, display_name: displayName })
    .select('id')
    .single()

  if (createError) throw createError
  return created.id
}
