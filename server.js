import { createWriteStream } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath  } from 'url'
import { config } from 'dotenv'
import express from 'express'
import compression from 'compression'
import morgan from 'morgan'
import logger from 'signale'
import routes from './api/routes.js'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const port = process.env.PORT || 3000
var accessLog = createWriteStream(resolve(__dirname, 'logs/access.log'), { flags: 'a' })

// Middleware
app.use(morgan('dev'))
app.use(morgan('combined', { stream: accessLog }))
app.use(compression())

routes(app)
app.listen(port, () => {
  logger.success('Server started on port', port)
})