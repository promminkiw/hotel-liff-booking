import { logger } from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  logger.error(err)
  const status = err.status ?? 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
}
