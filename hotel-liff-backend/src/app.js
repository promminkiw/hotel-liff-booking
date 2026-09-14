import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { corsOptions } from './config/cors.js'
import healthRoutes from './routes/health.routes.js'
import hotelInfoRoutes from './routes/hotelInfo.routes.js'
import roomsRoutes from './routes/rooms.routes.js'
import bookingsRoutes from './routes/bookings.routes.js'
import aiRoutes from './routes/ai.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(morgan('dev'))

  app.use('/health', healthRoutes)
  app.use('/api/hotel-info', hotelInfoRoutes)
  app.use('/api/rooms', roomsRoutes)
  app.use('/api/bookings', bookingsRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/admin', adminRoutes)

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(errorHandler)

  return app
}
