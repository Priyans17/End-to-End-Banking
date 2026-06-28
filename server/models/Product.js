const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true, enum: ['electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 'food', 'financial'] },
  subcategory: { type: String },
  brand: { type: String },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  weight: { type: Number },
  dimensions: { length: Number, width: Number, height: Number },
  seller: { type: String, default: 'Aura Store' },
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ category: 1, price: 1 })

module.exports = mongoose.model('Product', productSchema)