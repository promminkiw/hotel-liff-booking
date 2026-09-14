import { createSupabaseClient } from '../config/supabaseClient.js'

const ROOM_COLUMNS =
  'id, room_number, room_type, name, description, price_per_night, max_guests, bed_type, amenities, image_url, status'

export async function listRooms({ roomType, guests } = {}) {
  const supabase = createSupabaseClient()
  let query = supabase
    .from('rooms')
    .select(ROOM_COLUMNS)
    .eq('status', 'active')
    .order('room_type', { ascending: true })
    .order('room_number', { ascending: true })

  if (roomType) {
    query = query.eq('room_type', roomType)
  }
  if (guests) {
    query = query.gte('max_guests', guests)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getRoomById(id) {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('rooms').select(ROOM_COLUMNS).eq('id', id).maybeSingle()

  if (error) throw error
  return data
}
