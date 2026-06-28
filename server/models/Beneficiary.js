const mongoose = require('mongoose')

const beneficiarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nickname: { type: String },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  bank: { type: String, required: true },
  active: { type: Boolean, default: false },
  activatedAt: { type: Date },
  dailyLimit: { type: Number, default: 200000 },
}, { timestamps: true })

module.exports = mongoose.model('Beneficiary', beneficiarySchema)