import Environment from './config/environment.js'
import express, { type Express } from 'express'

import cors from 'cors'
import healthRoute from './routes/health.route.js'
import authRoute from './routes/auth.route.js'
import uploadRoute from './routes/upload.route.js'

const app: Express = express()

app.use(express.json({ limit: '10mb' }))
app.use(cors())
app.set('trust proxy', true)

// serve the public folder
app.use(express.static('public'))

const port = Environment.config().port

const router = express.Router()
app.use(router)
app.use('/', healthRoute)
app.use('/auth', authRoute)
app.use('/upload', uploadRoute)

// Listen on IPv6 port
app.listen(port, '::', () => {
  console.log(`🚀 Server is running at http://localhost:${port}`)
})
