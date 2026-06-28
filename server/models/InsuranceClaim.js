const mongoose = require('mongoose')

const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy' },
  claimNumber: { type: String, unique: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected', 'paid'], default: 'pending' },
  filedDate: { type: Date, default: Date.now },
  documents: [{ name: String, url: String }],
  remarks: { type: String },
}, { timestamps: true })

claimSchema.pre('save', function() {
  if (!this.claimNumber) {
    this.claimNumber = 'CLM' + Date.now() + Math.floor(Math.random() * 1000)
  }
})

module.exports = mongoose.model('InsuranceClaim', claimSchema)