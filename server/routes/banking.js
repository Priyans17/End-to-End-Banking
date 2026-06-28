const router = require('express').Router()
const auth = require('../middleware/auth')
const Account = require('../models/Account')
const Transaction = require('../models/Transaction')
const Beneficiary = require('../models/Beneficiary')

// Get accounts
router.get('/accounts', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id, isActive: true })
    res.json({ accounts })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get summary
router.get('/summary', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const savingsBalance = accounts.find(a => a.type === 'savings')?.balance || 0
    res.json({
      savingsBalance,
      portfolioValue: 0,
      mfInvested: 0,
      insuranceCover: 0,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1, from, to } = req.query
    const query = { user: req.user._id }
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = new Date(from)
      if (to) query.date.$lte = new Date(to)
    }
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
    const total = await Transaction.countDocuments(query)
    res.json({ transactions, total, page: parseInt(page) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Fund transfer
router.post('/transfer', auth, async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, mode, remarks } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' })

    const account = await Account.findOne({ _id: fromAccount, user: req.user._id })
    if (!account) return res.status(404).json({ message: 'Account not found' })
    if (account.balance < amount) return res.status(400).json({ message: 'Insufficient balance' })

    // Mode validation handled by Transaction model

    account.balance -= parseFloat(amount)
    await account.save()

    // Map transfer method to valid transaction mode
    const modeMap = { 'SWIFT': 'SWIFT', 'SEPA': 'SEPA', 'ACH': 'ACH', 'Wire Transfer': 'WIRE', 'Instant': 'INSTANT', 'NEFT': 'NEFT', 'RTGS': 'RTGS', 'IMPS': 'IMPS' }
    const txMode = modeMap[mode] || 'TRANSFER'
    const ref = txMode + Date.now()
    const tx = await Transaction.create({
      user: req.user._id, account: account._id,
      type: 'debit', amount: parseFloat(amount),
      balance: account.balance,
      description: remarks || `Transfer to ${toAccount}`,
      mode: txMode, reference: ref, toAccount,
      status: 'success'
    })

    res.json({ message: 'Transfer successful', transaction: tx, reference: ref })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get beneficiaries
router.get('/beneficiaries', auth, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ beneficiaries })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Add beneficiary
router.post('/beneficiaries', auth, async (req, res) => {
  try {
    const { name, accountNumber, ifsc, bank, nickname } = req.body
    const beneficiary = await Beneficiary.create({
      user: req.user._id, name, accountNumber, ifsc, bank, nickname,
      active: false, activatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })
    // Auto-activate after 24h (in production use a job scheduler)
    setTimeout(async () => {
      await Beneficiary.findByIdAndUpdate(beneficiary._id, { active: true })
    }, 24 * 60 * 60 * 1000)
    res.status(201).json({ beneficiary })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Bill payment
router.post('/bill-pay', auth, async (req, res) => {
  try {
    const { category, provider, consumerId, amount } = req.body
    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const account = accounts[0]
    if (!account || account.balance < amount) return res.status(400).json({ message: 'Insufficient balance' })

    account.balance -= parseFloat(amount)
    await account.save()

    const tx = await Transaction.create({
      user: req.user._id, account: account._id,
      type: 'debit', amount: parseFloat(amount),
      balance: account.balance,
      description: `${category} bill - ${provider} (${consumerId})`,
      mode: 'BILL_PAY', status: 'success',
      reference: 'BILL' + Date.now(),
      category
    })

    res.json({ message: 'Bill payment successful', transaction: tx })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Statement (returns JSON for now; PDF generation can be added)
router.get('/statement', auth, async (req, res) => {
  try {
    const { from, to } = req.query
    const query = { user: req.user._id }
    if (from) query.date = { $gte: new Date(from) }
    if (to) query.date = { ...query.date, $lte: new Date(to) }
    const transactions = await Transaction.find(query).sort({ date: -1 })
    res.json({ transactions, from, to, generatedAt: new Date() })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Statement PDF
router.get('/statement/pdf', auth, async (req, res) => {
  try {
    const PDFDocument = require('pdfkit')
    const { from, to } = req.query
    const query = { user: req.user._id }
    if (from) query.date = { $gte: new Date(from) }
    if (to) query.date = { ...query.date, $lte: new Date(to) }
    const transactions = await Transaction.find(query).sort({ date: -1 })
    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const User = require('../models/User')
    const user = await User.findById(req.user._id)

    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="aura-statement-${from || 'all'}-to-${to || 'now'}.pdf"`)
    doc.pipe(res)

    // Header background
    doc.rect(0, 0, 595, 120).fill('#1e3a8a')
    doc.fillColor('white').fontSize(28).font('Helvetica-Bold').text('AURA', 50, 30)
    doc.fontSize(11).font('Helvetica').text('Your Complete Financial Platform', 50, 62)
    doc.fontSize(14).font('Helvetica-Bold').text('Account Statement', 50, 82)

    // Account info box
    doc.fillColor('#1e3a8a').rect(50, 135, 495, 70).stroke()
    doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold').text('ACCOUNT HOLDER', 65, 145)
    doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text(user?.name || 'Account Holder', 65, 158)
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(user?.email || '', 65, 173)
    doc.fillColor('#1e3a8a').fontSize(10).font('Helvetica-Bold').text('STATEMENT PERIOD', 320, 145)
    doc.fillColor('#111827').fontSize(11).font('Helvetica').text(`${from || 'All time'} to ${to || new Date().toISOString().split('T')[0]}`, 320, 158)
    doc.fillColor('#6b7280').fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 320, 173)

    // Account balances
    let yPos = 225
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Account Summary', 50, yPos)
    yPos += 20
    accounts.forEach(acc => {
      doc.fillColor('#f9fafb').rect(50, yPos, 495, 28).fill()
      doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text(acc.type.toUpperCase().replace('_', ' ') + ' ACCOUNT', 60, yPos + 8)
      doc.text('****' + acc.accountNumber?.slice(-4), 200, yPos + 8)
      const bal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(acc.balance)
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').text(bal, 430, yPos + 8)
      yPos += 32
    })

    // Transactions table
    yPos += 10
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Transaction History', 50, yPos)
    yPos += 18

    // Table header
    doc.fillColor('#1e3a8a').rect(50, yPos, 495, 22).fill()
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
    doc.text('DATE', 58, yPos + 6)
    doc.text('DESCRIPTION', 130, yPos + 6)
    doc.text('MODE', 330, yPos + 6)
    doc.text('DEBIT', 390, yPos + 6)
    doc.text('CREDIT', 435, yPos + 6)
    doc.text('BALANCE', 480, yPos + 6)
    yPos += 24

    const fmtAmt = (n) => n ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : ''

    transactions.forEach((tx, i) => {
      if (yPos > 750) { doc.addPage(); yPos = 50 }
      if (i % 2 === 0) { doc.fillColor('#f9fafb').rect(50, yPos, 495, 18).fill() }
      doc.fillColor('#374151').fontSize(8).font('Helvetica')
      doc.text(new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }), 58, yPos + 4)
      const desc = tx.description?.length > 28 ? tx.description.slice(0, 28) + '...' : tx.description
      doc.text(desc || '', 130, yPos + 4)
      doc.text(tx.mode || '', 330, yPos + 4)
      if (tx.type === 'debit') { doc.fillColor('#dc2626').text(fmtAmt(tx.amount), 390, yPos + 4) }
      else { doc.fillColor('#16a34a').text(fmtAmt(tx.amount), 435, yPos + 4) }
      doc.fillColor('#374151').text(fmtAmt(tx.balance), 480, yPos + 4)
      yPos += 20
    })

    // Footer
    doc.fillColor('#9ca3af').fontSize(8).font('Helvetica').text('This is a computer-generated statement. Aura Financial Services. All rights reserved.', 50, 800, { align: 'center', width: 495 })

    doc.end()
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Statement Excel
router.get('/statement/excel', auth, async (req, res) => {
  try {
    const ExcelJS = require('exceljs')
    const { from, to } = req.query
    const query = { user: req.user._id }
    if (from) query.date = { $gte: new Date(from) }
    if (to) query.date = { ...query.date, $lte: new Date(to) }
    const transactions = await Transaction.find(query).sort({ date: -1 })
    const User = require('../models/User')
    const user = await User.findById(req.user._id)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Aura Financial'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Statement', { pageSetup: { paperSize: 9, orientation: 'landscape' } })

    // Title row
    sheet.mergeCells('A1:G1')
    sheet.getCell('A1').value = 'AURA FINANCIAL — ACCOUNT STATEMENT'
    sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a8a' } }
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getRow(1).height = 36

    // Info rows
    sheet.mergeCells('A2:G2')
    sheet.getCell('A2').value = `Account Holder: ${user?.name || ''} | Email: ${user?.email || ''} | Period: ${from || 'All'} to ${to || new Date().toISOString().split('T')[0]}`
    sheet.getCell('A2').font = { size: 10, color: { argb: 'FF374151' } }
    sheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFeff6ff' } }
    sheet.getRow(2).height = 20

    // Header row
    const headers = ['Date', 'Description', 'Mode', 'Reference', 'Debit (USD)', 'Credit (USD)', 'Balance (USD)']
    const headerRow = sheet.addRow(headers)
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a8a' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFe5e7eb' } } }
    })
    headerRow.height = 24

    // Column widths
    sheet.columns = [
      { key: 'date', width: 16 },
      { key: 'desc', width: 40 },
      { key: 'mode', width: 14 },
      { key: 'ref', width: 22 },
      { key: 'debit', width: 16 },
      { key: 'credit', width: 16 },
      { key: 'balance', width: 16 },
    ]

    // Data rows
    transactions.forEach((tx, i) => {
      const row = sheet.addRow([
        new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        tx.description || '',
        tx.mode || '',
        tx.reference || '',
        tx.type === 'debit' ? tx.amount : '',
        tx.type === 'credit' ? tx.amount : '',
        tx.balance || 0
      ])
      const bgColor = i % 2 === 0 ? 'FFf9fafb' : 'FFFFFFFF'
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
        cell.alignment = { vertical: 'middle' }
      })
      // Color debit/credit
      if (tx.type === 'debit') { row.getCell(5).font = { color: { argb: 'FFdc2626' }, bold: true } }
      else { row.getCell(6).font = { color: { argb: 'FF16a34a' }, bold: true } }
      row.getCell(7).font = { bold: true, color: { argb: 'FF1e3a8a' } }
      row.height = 18
    })

    // Summary row
    const totalDebit = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
    const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
    const summaryRow = sheet.addRow(['', 'TOTALS', '', '', totalDebit, totalCredit, ''])
    summaryRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="aura-statement-${from || 'all'}.xlsx"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ===== CARD MANAGEMENT =====
const Card = require('../models/Card')

// Get user's cards (seed default debit card if none)
router.get('/cards', auth, async (req, res) => {
  try {
    let cards = await Card.find({ user: req.user._id }).sort({ createdAt: 1 })
    if (cards.length === 0) {
      const accounts = await Account.find({ user: req.user._id, isActive: true })
      const acc = accounts[0]
      const User = require('../models/User')
      const user = await User.findById(req.user._id)
      const card = await Card.create({
        user: req.user._id, account: acc?._id,
        cardType: 'debit', network: 'Visa',
        cardHolder: user?.name?.toUpperCase() || 'AURA MEMBER',
        status: 'active', activatedAt: new Date(),
        color: '#1e3a8a'
      })
      cards = [card]
    }
    res.json({ cards })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Request new card
router.post('/cards/request', auth, async (req, res) => {
  try {
    const { cardType = 'debit', network = 'Visa', isVirtual = false } = req.body
    const accounts = await Account.find({ user: req.user._id, isActive: true })
    const User = require('../models/User')
    const user = await User.findById(req.user._id)
    const colors = { debit: '#1e3a8a', credit: '#111827', prepaid: '#065f46', virtual: '#6366f1' }
    const card = await Card.create({
      user: req.user._id, account: accounts[0]?._id,
      cardType, network, isVirtual,
      cardHolder: user?.name?.toUpperCase() || 'AURA MEMBER',
      status: isVirtual ? 'active' : 'pending',
      activatedAt: isVirtual ? new Date() : null,
      color: colors[cardType] || '#1e3a8a',
      dailyLimit: cardType === 'credit' ? 10000 : 5000,
      monthlyLimit: cardType === 'credit' ? 100000 : 50000,
    })
    res.status(201).json({ message: isVirtual ? 'Virtual card created instantly' : 'Card request submitted. Delivery in 5-7 business days.', card })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Toggle card lock
router.put('/cards/:id/toggle-lock', auth, async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id })
    if (!card) return res.status(404).json({ message: 'Card not found' })
    card.status = card.status === 'locked' ? 'active' : 'locked'
    await card.save()
    res.json({ message: card.status === 'locked' ? 'Card locked' : 'Card unlocked', card })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Update card settings
router.put('/cards/:id/settings', auth, async (req, res) => {
  try {
    const { internationalEnabled, contactlessEnabled, onlineEnabled, dailyLimit, monthlyLimit } = req.body
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { internationalEnabled, contactlessEnabled, onlineEnabled, dailyLimit, monthlyLimit } },
      { new: true }
    )
    if (!card) return res.status(404).json({ message: 'Card not found' })
    res.json({ message: 'Card settings updated', card })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Remove/delete card
router.delete('/cards/:id', auth, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!card) return res.status(404).json({ message: 'Card not found' })
    res.json({ message: 'Card removed successfully' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
