import { createSupabaseClient } from '../config/supabaseClient.js'

export async function getHotelInfo() {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('hotel_info').select('*').eq('id', 1).maybeSingle()

  if (error) throw error
  return data
}
