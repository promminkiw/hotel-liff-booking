import { env } from './config/env.js'
import { createApp } from './app.js'
import { logger } from './utils/logger.js'

const app = createApp()

app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`)
})
