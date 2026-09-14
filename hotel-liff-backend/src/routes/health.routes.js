import { Router } from 'express'
import { createSupabaseClient } from '../config/supabaseClient.js'

const router = Router()

router.get('/', async (req, res) => {
  const result = { status: 'ok', supabase: 'unknown' }

  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from('hotel_info').select('id').limit(1)
    result.supabase = error ? 'error' : 'ok'
  } catch {
    result.supabase = 'error'
  }

  const httpStatus = result.supabase === 'ok' ? 200 : 503
  res.status(httpStatus).json(result)
})

export default router
