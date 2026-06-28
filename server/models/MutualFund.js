const mongoose = require('mongoose')

const fundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amc: { type: String, required: true },
  category: { type: String, enum: ['Large Cap', 'Mid Cap', 'Small Cap', 'ELSS', 'Debt', 'Hybrid', 'Index'], required: true },
  nav: { type: Number, required: true },
  cagr1y: { type: Number },
  cagr3y: { type: Number },
  cagr5y: { type: Number },
  aum: { type: Number },
  expenseRatio: { type: Number },
  minSIP: { type: Number, default: 500 },
  minLumpsum: { type: Number, default: 5000 },
  riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Very High'], default: 'Moderate' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const sipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fund: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund' },
  fundName: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['Monthly', 'Quarterly', 'Weekly'], default: 'Monthly' },
  startDate: { type: Date, required: true },
  nextDate: { type: Date },
  mandate: { type: String, enum: ['Bank Transfer', 'Credit Card', 'Debit Card', 'UPI_AUTOPAY', 'eNACH'], default: 'Bank Transfer' },
  active: { type: Boolean, default: true },
  totalInvested: { type: Number, default: 0 },
  units: { type: Number, default: 0 },
}, { timestamps: true })

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fund: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund' },
  fundName: { type: String, required: true },
  invested: { type: Number, default: 0 },
  units: { type: Number, default: 0 },
  nav: { type: Number },
  currentValue: { type: Number, default: 0 },
  type: { type: String, enum: ['SIP', 'LUMPSUM'], default: 'SIP' },
}, { timestamps: true })

const Fund = mongoose.model('Fund', fundSchema)
const SIP = mongoose.model('SIP', sipSchema)
const Investment = mongoose.model('Investment', investmentSchema)

module.exports = { Fund, SIP, Investment }