import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

export function createSupabaseClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}
