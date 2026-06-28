const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, unique: true, required: true },
  type: { type: String, enum: ['savings', 'current', 'fixed_deposit'], default: 'savings' },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  ifsc: { type: String, default: 'AURA0001234' },
  branch: { type: String, default: 'Mumbai Main Branch' },
  isActive: { type: Boolean, default: true },
  interestRate: { type: Number, default: 3.5 },
  overdraftLimit: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Account', accountSchema)