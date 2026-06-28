const router = require('express').Router()
const auth = require('../middleware/auth')
const { Stock, TradeOrder, Holding } = require('../models/Trade')
const Account = require('../models/Account')
const Transaction = require('../models/Transaction')

// Seed stocks if empty
const seedStocks = async () => {
  const count = await Stock.countDocuments()
  if (count > 0) return
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', ltp: 2847.50, change: 34.20, changePct: 1.22, volume: 4521000, sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', ltp: 3912.80, change: -28.40, changePct: -0.72, volume: 1234000, sector: 'IT' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', ltp: 1678.30, change: 12.60, changePct: 0.76, volume: 3456000, sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', ltp: 1834.20, change: 22.10, changePct: 1.22, volume: 2345000, sector: 'IT' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE', ltp: 567.40, change: -4.30, changePct: -0.75, volume: 5678000, sector: 'IT' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', ltp: 1234.60, change: 18.90, changePct: 1.55, volume: 4321000, sector: 'Banking' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', exchange: 'NSE', ltp: 7234.80, change: 89.40, changePct: 1.25, volume: 876000, sector: 'Finance' },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', ltp: 812.30, change: -6.70, changePct: -0.82, volume: 8765000, sector: 'Banking' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', ltp: 987.60, change: 23.40, changePct: 2.43, volume: 6543000, sector: 'Auto' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', exchange: 'NSE', ltp: 2456.70, change: -34.50, changePct: -1.39, volume: 2345000, sector: 'Conglomerate' },
  ]
  await Stock.insertMany(stocks)
}

// Market watch
router.get('/market-watch', auth, async (req, res) => {
  try {
    await seedStocks()
    const stocks = await Stock.find().sort({ symbol: 1 })
    res.json({ stocks })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Portfolio / holdings
router.get('/portfolio', auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id })
    // Update LTP from stocks
    const updated = await Promise.all(holdings.map(async h => {
      const stock = await Stock.findOne({ symbol: h.symbol })
      if (stock) { h.ltp = stock.ltp; await h.save() }
      return h
    }))
    res.json({ holdings: updated })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await TradeOrder.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
    res.json({ orders })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Place order
router.post('/order', auth, async (req, res) => {
  try {
    const { symbol, exchange, side, type, qty, price, stopLoss } = req.body
    if (!symbol || !side || !qty) return res.status(400).json({ message: 'Symbol, side, and quantity are required' })

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
    if (!stock) return res.status(404).json({ message: 'Stock not found in market watch' })

    const executedPrice = type === 'MARKET' ? stock.ltp : parseFloat(price)
    const totalCost = executedPrice * parseInt(qty)

    // Validate funds for BUY
    if (side === 'BUY') {
      const accounts = await Account.find({ user: req.user._id, isActive: true })
      const account = accounts[0]
      if (!account || account.balance < totalCost) return res.status(400).json({ message: 'Insufficient funds for this order' })
      account.balance -= totalCost
      await account.save()
      await Transaction.create({
        user: req.user._id, account: account._id,
        type: 'debit', amount: totalCost, balance: account.balance,
        description: `BUY ${qty} ${symbol} @ ₹${executedPrice}`,
        mode: 'PURCHASE', status: 'success', reference: 'TRD' + Date.now()
      })
      // Update holding
      const existing = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() })
      if (existing) {
        const totalQty = existing.qty + parseInt(qty)
        existing.avgPrice = ((existing.avgPrice * existing.qty) + totalCost) / totalQty
        existing.qty = totalQty
        existing.ltp = stock.ltp
        await existing.save()
      } else {
        await Holding.create({ user: req.user._id, symbol: symbol.toUpperCase(), exchange, qty: parseInt(qty), avgPrice: executedPrice, ltp: stock.ltp })
      }
    }

    if (side === 'SELL') {
      const holding = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() })
      if (!holding || holding.qty < parseInt(qty)) return res.status(400).json({ message: 'Insufficient shares to sell' })
      holding.qty -= parseInt(qty)
      if (holding.qty === 0) await Holding.deleteOne({ _id: holding._id })
      else await holding.save()
      const accounts = await Account.find({ user: req.user._id, isActive: true })
      const account = accounts[0]
      if (account) {
        account.balance += totalCost
        await account.save()
        await Transaction.create({
          user: req.user._id, account: account._id,
          type: 'credit', amount: totalCost, balance: account.balance,
          description: `SELL ${qty} ${symbol} @ ₹${executedPrice}`,
          mode: 'PURCHASE', status: 'success', reference: 'TRD' + Date.now()
        })
      }
    }

    const order = await TradeOrder.create({
      user: req.user._id, symbol: symbol.toUpperCase(), exchange, side, type,
      qty: parseInt(qty), price: executedPrice, stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      executedPrice, status: 'EXECUTED', executedAt: new Date()
    })

    res.status(201).json({ message: `${side} order executed successfully`, order })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router