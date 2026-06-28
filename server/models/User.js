
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone: { type: Number },
  countryCode: { type: String, default: '+1' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  address: { line1: String, city: String, state: String, postalCode: String, country: String },
  profileImage: { type: String },
  consentGiven: { type: Boolean, default: false },
  consentDate: { type: Date },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true })

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now()
}

module.exports = mongoose.model('User', userSchema)
