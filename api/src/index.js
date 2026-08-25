import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import notebookRoutes from './routes/notebooks.js'
import questionRoutes from './routes/questions.js'
import qaRoutes from './routes/qa.js'
import reviewRoutes from './routes/review.js'
import analyticsRoutes from './routes/analytics.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploaded images
app.use('/uploads', express.static('uploads'))

// API Routes - base path /api/v1
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/notebooks', notebookRoutes)
app.use('/api/v1/questions', questionRoutes)
app.use('/api/v1/qa', qaRoutes)
app.use('/api/v1/review', reviewRoutes)
app.use('/api/v1/analytics', analyticsRoutes)

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ code: 200, msg: 'ok', data: { status: 'healthy', timestamp: new Date().toISOString() } })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[Recall API] Server running on http://localhost:${PORT}`)
  console.log(`[Recall API] API base: http://localhost:${PORT}/api/v1`)
})
