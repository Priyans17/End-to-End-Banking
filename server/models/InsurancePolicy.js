const mongoose = require('mongoose')

const insurancePlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  insurer: { type: String, required: true },
  type: { type: String, enum: ['health', 'life', 'motor', 'home', 'travel'], required: true },
  sumInsured: { type: Number, required: true },
  premium: { type: Number, required: true },
  claimRatio: { type: Number },
  networkHospitals: { type: Number },
  features: [String],
  recommended: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const insurancePolicySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePlan' },
  planName: { type: String, required: true },
  insurer: { type: String, required: true },
  policyNumber: { type: String, unique: true },
  type: { type: String, enum: ['health', 'life', 'motor', 'home', 'travel'], required: true },
  sumInsured: { type: Number, required: true },
  premium: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  nominees: [{ name: String, relation: String, share: Number }],
  dob: { type: Date },
  gender: { type: String },
  smoker: { type: Boolean, default: false },
  paymentId: { type: String },
}, { timestamps: true })

insurancePolicySchema.pre('save', function() {
  if (!this.policyNumber) {
    this.policyNumber = 'POL' + Date.now() + Math.floor(Math.random() * 1000)
  }
  if (!this.expiryDate) {
    const d = new Date(this.startDate || Date.now())
    d.setFullYear(d.getFullYear() + 1)
    this.expiryDate = d
  }
})

const InsurancePlan = mongoose.model('InsurancePlan', insurancePlanSchema)
const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema)

module.exports = { InsurancePlan, InsurancePolicy }