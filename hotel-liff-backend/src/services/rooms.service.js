import { createSupabaseClient } from '../config/supabaseClient.js'

export async function listRooms() {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('id, room_number, room_type, name, description, price_per_night, max_guests, bed_type, amenities, image_url, status')
    .eq('status', 'active')
    .order('room_type', { ascending: true })
    .order('room_number', { ascending: true })

  if (error) throw error
  return data
}
