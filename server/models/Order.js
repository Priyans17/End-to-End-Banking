const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String, phone: String,
    line1: String, line2: String,
    city: String, state: String,
    pincode: String, country: { type: String, default: 'India' }
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'apple_pay', 'google_pay', 'stripe', 'bank_transfer'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String },
  itemsTotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'placed' },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  notes: { type: String },
}, { timestamps: true })

orderSchema.pre('save', function() {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
  }
})

module.exports = mongoose.model('Order', orderSchema)