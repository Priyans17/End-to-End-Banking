require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// Security middleware
app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(morgan('dev'))
// Stripe webhook needs raw body
app.use('/api/payments/webhook', require('express').raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Apple Pay domain verification (required for Stripe Apple Pay)
app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('apple-developer-merchantid-domain-association')
})

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, please try again later.' })
app.use('/api/', limiter)

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/banking', require('./routes/banking'))
app.use('/api/trading', require('./routes/trading'))
app.use('/api/mutual-funds', require('./routes/mutualFunds'))
app.use('/api/insurance', require('./routes/insurance'))
app.use('/api/shop', require('./routes/shop'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/user', require('./routes/user'))
app.use('/api/notifications', require('./routes/notifications'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// Connect DB and start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1) })