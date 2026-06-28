const router = require('express').Router()
const auth = require('../middleware/auth')
const Product = require('../models/Product')

const seedProducts = async () => {
  const count = await Product.countDocuments()
  if (count > 0) return
  const products = [
    { name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro 256GB Natural Titanium', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'], stock: 50, sku: 'APPL-IP15P-256', rating: 4.8, numReviews: 1240, isFeatured: true, discount: 10, tags: ['smartphone', 'apple', '5g'] },
    { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', price: 129999, originalPrice: 139999, category: 'electronics', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'], stock: 35, sku: 'SAMS-S24U-512', rating: 4.7, numReviews: 890, isFeatured: true, discount: 7, tags: ['smartphone', 'samsung', '5g'] },
    { name: 'Sony WH-1000XM5', description: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 24990, originalPrice: 29990, category: 'electronics', brand: 'Sony', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], stock: 120, sku: 'SONY-WH1000XM5', rating: 4.9, numReviews: 2340, isFeatured: true, discount: 17, tags: ['headphones', 'wireless', 'noise-cancelling'] },
    { name: 'MacBook Air M3', description: 'Apple MacBook Air 13-inch M3 chip 16GB RAM 512GB SSD', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], stock: 25, sku: 'APPL-MBA-M3-512', rating: 4.9, numReviews: 567, isFeatured: true, discount: 10, tags: ['laptop', 'apple', 'macbook'] },
    { name: 'Nike Air Max 270', description: 'Nike Air Max 270 Running Shoes - Black/White', price: 12995, originalPrice: 15995, category: 'fashion', brand: 'Nike', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], stock: 200, sku: 'NIKE-AM270-BW', rating: 4.5, numReviews: 3450, discount: 19, tags: ['shoes', 'running', 'nike'] },
    { name: 'Levi\'s 511 Slim Jeans', description: 'Levi\'s 511 Slim Fit Jeans - Dark Wash', price: 3499, originalPrice: 4999, category: 'fashion', brand: 'Levi\'s', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], stock: 300, sku: 'LEVIS-511-DW-32', rating: 4.4, numReviews: 1890, discount: 30, tags: ['jeans', 'denim', 'levis'] },
    { name: 'Dyson V15 Detect', description: 'Dyson V15 Detect Cordless Vacuum Cleaner', price: 52900, originalPrice: 62900, category: 'home', brand: 'Dyson', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], stock: 40, sku: 'DYSON-V15-DET', rating: 4.8, numReviews: 456, discount: 16, tags: ['vacuum', 'cordless', 'dyson'] },
    { name: 'Instant Pot Duo 7-in-1', description: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker 6Qt', price: 8999, originalPrice: 11999, category: 'home', brand: 'Instant Pot', images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=400'], stock: 80, sku: 'IPOT-DUO-6QT', rating: 4.7, numReviews: 5670, discount: 25, tags: ['kitchen', 'pressure-cooker', 'instant-pot'] },
    { name: 'Aura Gold Credit Card', description: 'Premium metal credit card with 5% cashback on all purchases', price: 999, originalPrice: 999, category: 'financial', brand: 'Aura', images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'], stock: 1000, sku: 'AURA-GOLD-CC', rating: 4.9, numReviews: 234, isFeatured: true, tags: ['credit-card', 'cashback', 'premium'] },
    { name: 'Aura Wealth Management Plan', description: 'Personalized wealth management with dedicated advisor', price: 4999, originalPrice: 7999, category: 'financial', brand: 'Aura', images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'], stock: 500, sku: 'AURA-WMP-ANNUAL', rating: 4.8, numReviews: 123, isFeatured: true, discount: 37, tags: ['wealth', 'investment', 'advisory'] },
  ]
  await Product.insertMany(products)
}

// Get all products
router.get('/products', async (req, res) => {
  try {
    await seedProducts()
    const { category, search, sort = '-createdAt', page = 1, limit = 12, featured } = req.query
    const query = { isActive: true }
    if (category) query.category = category
    if (featured === 'true') query.isFeatured = true
    if (search) query.$text = { $search: search }

    const sortMap = { price_asc: 'price', price_desc: '-price', rating: '-rating', newest: '-createdAt' }
    const sortField = sortMap[sort] || sort

    const products = await Product.find(query).sort(sortField).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit))
    const total = await Product.countDocuments(query)
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ product })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Add review
router.post('/products/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const alreadyReviewed = product.reviews.find(r => r.user?.toString() === req.user._id.toString())
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' })
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: parseInt(rating), comment })
    product.numReviews = product.reviews.length
    product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
    await product.save()
    res.status(201).json({ message: 'Review added' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    res.json({ categories })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router