const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  exchange: { type: String, enum: ['NYSE', 'NASDAQ', 'LSE', 'Euronext', 'TSX', 'ASX', 'NSE', 'BSE'], default: 'NYSE' },
  ltp: { type: Number, required: true },
  open: { type: Number },
  high: { type: Number },
  low: { type: Number },
  close: { type: Number },
  change: { type: Number, default: 0 },
  changePct: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  marketCap: { type: Number },
  sector: { type: String },
}, { timestamps: true })

const tradeOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true, uppercase: true },
  exchange: { type: String, enum: ['NYSE', 'NASDAQ', 'LSE', 'Euronext', 'TSX', 'ASX', 'NSE', 'BSE'], default: 'NYSE' },
  side: { type: String, enum: ['BUY', 'SELL'], required: true },
  type: { type: String, enum: ['MARKET', 'LIMIT', 'STOP_LOSS'], default: 'MARKET' },
  qty: { type: Number, required: true },
  price: { type: Number },
  stopLoss: { type: Number },
  executedPrice: { type: Number },
  status: { type: String, enum: ['PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED'], default: 'PENDING' },
  executedAt: { type: Date },
}, { timestamps: true })

const holdingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true, uppercase: true },
  exchange: { type: String, default: 'NSE' },
  qty: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  ltp: { type: Number },
}, { timestamps: true })

holdingSchema.index({ user: 1, symbol: 1 }, { unique: true })

const Stock = mongoose.model('Stock', stockSchema)
const TradeOrder = mongoose.model('TradeOrder', tradeOrderSchema)
const Holding = mongoose.model('Holding', holdingSchema)

module.exports = { Stock, TradeOrder, Holding }