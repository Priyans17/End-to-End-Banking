const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number },
  description: { type: String, required: true },
  mode: { type: String, enum: ['NEFT', 'RTGS', 'IMPS', 'UPI', 'ATM', 'BILL_PAY', 'INTEREST', 'TRANSFER', 'PURCHASE', 'REFUND', 'SWIFT', 'SEPA', 'ACH', 'WIRE', 'INSTANT'], default: 'TRANSFER' },
  status: { type: String, enum: ['pending', 'success', 'failed', 'reversed'], default: 'success' },
  reference: { type: String },
  toAccount: { type: String },
  fromAccount: { type: String },
  category: { type: String, default: 'general' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ account: 1, date: -1 })

module.exports = mongoose.model('Transaction', transactionSchema)