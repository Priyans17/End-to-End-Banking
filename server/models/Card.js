const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  cardType: { type: String, enum: ['debit', 'credit', 'prepaid', 'virtual'], default: 'debit' },
  cardNumber: { type: String },
  last4: { type: String },
  expiryMonth: { type: Number },
  expiryYear: { type: Number },
  cvv: { type: String },
  cardHolder: { type: String },
  network: { type: String, enum: ['Visa', 'Mastercard', 'Amex', 'Discover'], default: 'Visa' },
  status: { type: String, enum: ['active', 'locked', 'blocked', 'expired', 'pending'], default: 'active' },
  isVirtual: { type: Boolean, default: false },
  dailyLimit: { type: Number, default: 5000 },
  monthlyLimit: { type: Number, default: 50000 },
  internationalEnabled: { type: Boolean, default: true },
  contactlessEnabled: { type: Boolean, default: true },
  onlineEnabled: { type: Boolean, default: true },
  color: { type: String, default: '#1e3a8a' },
  requestedAt: { type: Date, default: Date.now },
  activatedAt: { type: Date },
}, { timestamps: true })

cardSchema.pre('save', function() {
  if (!this.cardNumber) {
    const num = Array.from({length: 16}, () => Math.floor(Math.random() * 10)).join('')
    this.cardNumber = num
    this.last4 = num.slice(-4)
  }
  if (!this.expiryMonth) {
    const d = new Date()
    this.expiryMonth = d.getMonth() + 1
    this.expiryYear = d.getFullYear() + 4
  }
  if (!this.cvv) {
    this.cvv = String(Math.floor(Math.random() * 900) + 100)
  }
})

module.exports = mongoose.model('Card', cardSchema)