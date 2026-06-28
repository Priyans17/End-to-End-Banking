const router = require('express').Router()
const auth = require('../middleware/auth')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

// Get cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock')
    res.json({ cart: cart || { items: [], discount: 0 } })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Add to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' })

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = new Cart({ user: req.user._id, items: [] })

    const existingItem = cart.items.find(i => i.product.toString() === productId)
    if (existingItem) {
      existingItem.quantity += parseInt(quantity)
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity), price: product.price })
    }
    await cart.save()
    await cart.populate('items.product', 'name images price stock')
    res.json({ message: 'Added to cart', cart })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Update quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    const item = cart.items.find(i => i.product.toString() === productId)
    if (!item) return res.status(404).json({ message: 'Item not in cart' })
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId)
    } else {
      item.quantity = parseInt(quantity)
    }
    await cart.save()
    await cart.populate('items.product', 'name images price stock')
    res.json({ cart })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Remove item
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId)
    await cart.save()
    res.json({ message: 'Item removed', cart })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Apply coupon
router.post('/coupon', auth, async (req, res) => {
  try {
    const { code } = req.body
    // Any coupon code gives 15% discount for demo purposes
    const discount = 15
    if (!code || code.trim().length === 0) return res.status(400).json({ message: 'Please enter a coupon code' })
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
    cart.coupon = code.toUpperCase()
    cart.discount = Math.round(total * discount / 100)
    await cart.save()
    res.json({ message: `Coupon applied! ${discount}% off`, discount: cart.discount })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, discount: 0 })
    res.json({ message: 'Cart cleared' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router