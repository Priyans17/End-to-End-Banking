const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Account = require('../models/Account')
const auth = require('../middleware/auth')

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, pan, aadhaar } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })
    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: 'Valid email required' })
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, phone, pan, aadhaar, consentGiven: true, consentDate: new Date() })

    // Create default savings account
    const accNum = '10' + Date.now().toString().slice(-10)
    await Account.create({ user: user._id, accountNumber: accNum, type: 'savings', balance: 50000 })

    const token = signToken(user._id)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, kycStatus: user.kycStatus }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (user.isLocked()) return res.status(423).json({ message: 'Account temporarily locked. Try again later.' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1
      const update = { loginAttempts: attempts }
      if (attempts >= 5) update.lockUntil = new Date(Date.now() + 30 * 60 * 1000)
      await User.updateOne({ _id: user._id }, update)
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    await User.updateOne({ _id: user._id }, { loginAttempts: 0, lockUntil: null, lastLogin: new Date() })

    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, kycStatus: user.kycStatus, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user })
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true }).select('-password')
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router