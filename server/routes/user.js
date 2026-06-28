const router = require('express').Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const Order = require('../models/Order')
const Transaction = require('../models/Transaction')

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ user })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, profileImage },
      { new: true }
    ).select('-password')
    res.json({ user })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get dashboard summary
router.get('/dashboard-summary', auth, async (req, res) => {
  try {
    const [orderCount, txCount] = await Promise.all([
      Order.countDocuments({ user: req.user._id }),
      Transaction.countDocuments({ user: req.user._id }),
    ])
    res.json({ orderCount, txCount })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Delete account (DPDP Act compliance)
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false, email: `deleted_${Date.now()}@aura.deleted` })
    res.json({ message: 'Account deactivated. Data will be purged within 30 days per DPDP Act 2023.' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Consent management
router.put('/consent', auth, async (req, res) => {
  try {
    const { consentGiven } = req.body
    await User.findByIdAndUpdate(req.user._id, { consentGiven, consentDate: new Date() })
    res.json({ message: `Consent ${consentGiven ? 'granted' : 'withdrawn'} successfully` })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router