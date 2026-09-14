import { Router } from 'express'
import { getHotelInfo } from '../services/hotelInfo.service.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    res.json({ hotelInfo: await getHotelInfo() })
  } catch (err) {
    next(err)
  }
})

export default router
