import { config } from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import routes from './api/routes.js'

config()

const app = express()
const port = process.env.PORT || 3000

app.use(morgan('dev'))

routes(app)
app.listen(port, () => {
  console.log('Server started on port', port)
})