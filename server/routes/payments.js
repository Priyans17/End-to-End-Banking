const router = require('express').Router()
const auth = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')
const Account = require('../models/Account')
const Transaction = require('../models/Transaction')
const Stripe = require('stripe')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// Get Stripe publishable key
router.get('/config', auth, (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY })
})

// Create Stripe Payment Intent
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethod } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user._id.toString(), paymentMethod: paymentMethod || 'card' }
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })
  } catch (err) {
    console.error('Stripe create-intent error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// Confirm payment & record transaction
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId, amount, orderId } = req.body

    let status = 'succeeded'
    let paymentId = paymentIntentId

    if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      status = pi.status
      if (status !== 'succeeded') {
        return res.status(402).json({ message: `Payment not completed. Status: ${status}` })
      }
    }

    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const account = accounts[0]
    if (account) {
      await Transaction.create({
        user: req.user._id, account: account._id,
        type: 'debit', amount: parseFloat(amount), balance: account.balance,
        description: `Payment${orderId ? ' for order ' + orderId : ''}`,
        mode: 'PURCHASE', status: 'success', reference: paymentId
      })
    }

    res.json({ success: true, paymentId, status: 'succeeded', amount, timestamp: new Date() })
  } catch (err) {
    console.error('Stripe confirm error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// Digital wallet (Apple Pay / Google Pay via Stripe Payment Element)
router.post('/digital-wallet', auth, async (req, res) => {
  try {
    const { walletType, amount } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount || 1) * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { walletType: walletType || 'card', userId: req.user._id.toString() }
    })
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      walletType, merchantName: 'Aura Financial'
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body
    if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      return res.json({ verified: pi.status === 'succeeded', status: pi.status, paymentId: pi.id, timestamp: new Date() })
    }
    res.json({ verified: true, timestamp: new Date() })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Refund via Stripe
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body
    let refundId = 'rfnd_' + uuidv4().replace(/-/g, '').slice(0, 14)

    if (paymentId && paymentId.startsWith('pi_')) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: amount ? Math.round(parseFloat(amount) * 100) : undefined,
          reason: 'requested_by_customer'
        })
        refundId = refund.id
      } catch (stripeErr) {
        console.error('Stripe refund error:', stripeErr.message)
      }
    }

    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const account = accounts[0]
    if (account) {
      account.balance += parseFloat(amount)
      await account.save()
      await Transaction.create({
        user: req.user._id, account: account._id,
        type: 'credit', amount: parseFloat(amount), balance: account.balance,
        description: `Refund - ${reason || 'Order cancelled'}`,
        mode: 'REFUND', status: 'success', reference: refundId
      })
    }

    res.json({ success: true, refundId, amount, status: 'processed', timestamp: new Date() })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Generate QR code for payment
router.get('/qr/:paymentIntentId', auth, async (req, res) => {
  try {
    const QRCode = require('qrcode')
    const { paymentIntentId } = req.params
    const paymentUrl = `https://payments.stripe.com/payment_methods/test_payment?payment_intent=${paymentIntentId}`
    const qrDataUrl = await QRCode.toDataURL(paymentUrl, { width: 300, margin: 2, color: { dark: '#1e3a8a', light: '#ffffff' } })
    res.json({ qrCode: qrDataUrl, paymentUrl, paymentIntentId })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = JSON.parse(req.body.toString())
    }
  } catch (err) {
    console.error('Webhook error:', err.message)
    return res.status(400).send('Webhook Error: ' + err.message)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object
        console.log('Payment succeeded:', pi.id, 'Amount:', pi.amount / 100, pi.currency.toUpperCase())
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object
        console.log('Payment failed:', pi.id, pi.last_payment_error?.message)
        break
      }
      case 'charge.refunded': {
        console.log('Charge refunded:', event.data.object.id)
        break
      }
      default:
        console.log('Unhandled webhook event:', event.type)
    }
    res.json({ received: true, type: event.type })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
