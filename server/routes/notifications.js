const router = require('express').Router()
const auth = require('../middleware/auth')
const Notification = require('../models/Notification')

// Seed sample notifications for new users
const seedNotifications = async (userId) => {
  const count = await Notification.countDocuments({ user: userId })
  if (count > 0) return
  await Notification.insertMany([
    { user: userId, title: 'Welcome to Aura', message: 'Your account is set up and ready. Explore banking, investments, and more.', type: 'system', read: false },
    { user: userId, title: 'Account Verified', message: 'Your identity has been verified. You now have full access to all features.', type: 'security', read: false },
    { user: userId, title: 'Market Update', message: 'AAPL is up 2.4% today. Your portfolio has gained value.', type: 'investment', read: false },
    { user: userId, title: 'SIP Reminder', message: 'Your monthly SIP of $100 is due in 3 days. Ensure sufficient balance.', type: 'investment', read: true },
    { user: userId, title: 'Security Alert', message: 'New login detected from a new device. If this was not you, change your password immediately.', type: 'security', read: true },
  ])
}

// GET all notifications
router.get('/', auth, async (req, res) => {
  try {
    await seedNotifications(req.user._id)
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20)
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false })
    res.json({ notifications, unreadCount })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH mark one as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// DELETE one notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router