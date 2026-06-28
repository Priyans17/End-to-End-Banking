const router = require('express').Router()
const auth = require('../middleware/auth')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Account = require('../models/Account')
const Transaction = require('../models/Transaction')
const Product = require('../models/Product')

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name images')
    res.json({ orders })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ order })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentId } = req.body
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' })

    const itemsTotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const shippingCost = itemsTotal > 999 ? 0 : 99
    const tax = Math.round(itemsTotal * 0.18)
    const totalAmount = itemsTotal + shippingCost + tax - (cart.discount || 0)

    // Deduct from bank account if paying via netbanking/wallet
    if (['netbanking', 'wallet'].includes(paymentMethod)) {
      const accounts = await Account.find({ user: req.user._id, isActive: true })
      const account = accounts[0]
      if (!account || account.balance < totalAmount) return res.status(400).json({ message: 'Insufficient balance' })
      account.balance -= totalAmount
      await account.save()
      await Transaction.create({
        user: req.user._id, account: account._id,
        type: 'debit', amount: totalAmount, balance: account.balance,
        description: `Online purchase - ${cart.items.length} item(s)`,
        mode: 'PURCHASE', status: 'success', reference: 'ORD' + Date.now()
      })
    }

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
    }

    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(i => ({ product: i.product._id, name: i.product.name, image: i.product.images?.[0], price: i.price, quantity: i.quantity })),
      shippingAddress, paymentMethod,
      paymentStatus: paymentId ? 'paid' : (paymentMethod === 'cod' ? 'pending' : 'paid'),
      paymentId, itemsTotal, shippingCost, tax,
      discount: cart.discount || 0, totalAmount,
      status: 'confirmed', estimatedDelivery
    })

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, discount: 0 })

    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (['shipped', 'delivered'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' })
    order.status = 'cancelled'
    await order.save()
    res.json({ message: 'Order cancelled', order })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router