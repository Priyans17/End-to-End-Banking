const router = require('express').Router()
const auth = require('../middleware/auth')
const { Fund, SIP, Investment } = require('../models/MutualFund')
const Account = require('../models/Account')
const Transaction = require('../models/Transaction')

const seedFunds = async () => {
  const count = await Fund.countDocuments()
  if (count > 0) return
  const funds = [
    { name: 'Vanguard 500 Index Fund', amc: 'Vanguard', category: 'Large Cap', nav: 98.45, cagr1y: 18.2, cagr3y: 14.8, cagr5y: 16.2, aum: 350000, expenseRatio: 0.04, riskLevel: 'Moderate' },
    { name: 'Fidelity 500 Index Fund', amc: 'Fidelity', category: 'Large Cap', nav: 54.32, cagr1y: 16.8, cagr3y: 13.2, cagr5y: 15.1, aum: 280000, expenseRatio: 0.015, riskLevel: 'Moderate' },
    { name: 'Schwab Total Market Index', amc: 'Charles Schwab', category: 'Hybrid', nav: 72.18, cagr1y: 22.4, cagr3y: 18.6, cagr5y: 20.3, aum: 420000, expenseRatio: 0.03, riskLevel: 'Moderate' },
    { name: 'iShares Russell 2000 ETF', amc: 'BlackRock', category: 'Small Cap', nav: 134.67, cagr1y: 28.4, cagr3y: 22.1, cagr5y: 24.8, aum: 180000, expenseRatio: 0.19, riskLevel: 'Very High' },
    { name: 'Vanguard Mid-Cap Index Fund', amc: 'Vanguard', category: 'Mid Cap', nav: 112.34, cagr1y: 24.6, cagr3y: 19.8, cagr5y: 21.4, aum: 320000, expenseRatio: 0.05, riskLevel: 'High' },
    { name: 'S&P 500 Index Fund', amc: 'State Street', category: 'Index', nav: 145.23, cagr1y: 15.4, cagr3y: 12.8, cagr5y: 14.2, aum: 250000, expenseRatio: 0.09, riskLevel: 'Moderate' },
    { name: 'T. Rowe Price Growth Fund', amc: 'T. Rowe Price', category: 'ELSS', nav: 89.76, cagr1y: 26.8, cagr3y: 21.4, cagr5y: 23.1, aum: 80000, expenseRatio: 0.52, riskLevel: 'High' },
    { name: 'Vanguard Total Bond Market', amc: 'Vanguard', category: 'Debt', nav: 42.18, cagr1y: 7.2, cagr3y: 6.8, cagr5y: 7.1, aum: 150000, expenseRatio: 0.03, riskLevel: 'Low' },
  ]
  await Fund.insertMany(funds)
}

router.get('/explore', auth, async (req, res) => {
  try {
    await seedFunds()
    const { category } = req.query
    const query = { isActive: true }
    if (category && category !== 'All') query.category = category
    const funds = await Fund.find(query).sort({ cagr3y: -1 })
    res.json({ funds })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get('/investments', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
    res.json({ investments })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get('/sips', auth, async (req, res) => {
  try {
    const sips = await SIP.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ sips })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/sip', auth, async (req, res) => {
  try {
    const { fundName, amount, frequency, startDate, mandate } = req.body
    if (!fundName || !amount || !startDate) return res.status(400).json({ message: 'Fund name, amount, and start date are required' })
    if (amount < 10) return res.status(400).json({ message: 'Minimum SIP amount is $10' })

    const nextDate = new Date(startDate)
    const sip = await SIP.create({ user: req.user._id, fundName, amount: parseFloat(amount), frequency, startDate: new Date(startDate), nextDate, mandate, active: true })
    res.status(201).json({ message: 'SIP registered successfully', sip })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/invest', auth, async (req, res) => {
  try {
    const { fundId, amount, type } = req.body
    const fund = await Fund.findById(fundId)
    if (!fund) return res.status(404).json({ message: 'Fund not found' })

    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const account = accounts[0]
    if (!account || account.balance < amount) return res.status(400).json({ message: 'Insufficient balance' })

    const units = parseFloat(amount) / fund.nav
    account.balance -= parseFloat(amount)
    await account.save()

    await Transaction.create({
      user: req.user._id, account: account._id,
      type: 'debit', amount: parseFloat(amount), balance: account.balance,
      description: `MF Investment - ${fund.name}`,
      mode: 'PURCHASE', status: 'success', reference: 'MF' + Date.now()
    })

    const existing = await Investment.findOne({ user: req.user._id, fundName: fund.name })
    if (existing) {
      existing.invested += parseFloat(amount)
      existing.units += units
      existing.nav = fund.nav
      existing.currentValue = existing.units * fund.nav
      await existing.save()
    } else {
      await Investment.create({ user: req.user._id, fund: fund._id, fundName: fund.name, invested: parseFloat(amount), units, nav: fund.nav, currentValue: parseFloat(amount), type: (type || "LUMPSUM").toUpperCase() })
    }

    res.json({ message: 'Investment successful', units: units.toFixed(3) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/sip/:id/cancel', auth, async (req, res) => {
  try {
    const sip = await SIP.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { active: false, cancelledAt: new Date() } },
      { new: true }
    )
    if (!sip) return res.status(404).json({ message: 'SIP not found' })
    res.json({ message: 'SIP cancelled successfully', sip })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get investment by ID
router.get('/investments/:id', auth, async (req, res) => {
  try {
    const inv = await Investment.findOne({ _id: req.params.id, user: req.user._id })
    if (!inv) return res.status(404).json({ message: 'Investment not found' })
    res.json({ investment: inv })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
