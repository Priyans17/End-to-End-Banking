const router = require("express").Router()
const auth = require("../middleware/auth")
const { InsurancePlan, InsurancePolicy } = require("../models/InsurancePolicy")
const InsuranceClaim = require("../models/InsuranceClaim")

const seedPlans = async () => {
  const count = await InsurancePlan.countDocuments()
  if (count > 0) return
  await InsurancePlan.insertMany([
    { name: "Aura Health Shield", insurer: "Aura Insurance Group", type: "health", sumInsured: 500000, premium: 299, claimRatio: 98.2, networkHospitals: 14000, features: ["Cashless hospitalization", "Pre & post hospitalization", "Day care procedures"], recommended: true },
    { name: "Aura Health Plus", insurer: "Aura Insurance Group", type: "health", sumInsured: 1000000, premium: 499, claimRatio: 96.8, networkHospitals: 12000, features: ["Critical illness cover", "Maternity benefit", "OPD cover"] },
    { name: "Aura Life Secure", insurer: "Aura Life Insurance", type: "life", sumInsured: 1000000, premium: 89, claimRatio: 99.1, features: ["Pure term plan", "Accidental death benefit", "Critical illness rider"], recommended: true },
    { name: "Aura Motor Protect", insurer: "Aura General Insurance", type: "motor", sumInsured: 50000, premium: 149, claimRatio: 94.5, features: ["Zero depreciation", "Engine protection", "Roadside assistance"] },
    { name: "Aura Home Guard", insurer: "Aura General Insurance", type: "home", sumInsured: 500000, premium: 79, claimRatio: 95.2, features: ["Structure & contents", "Natural calamities", "Burglary cover"] },
    { name: "Aura Travel Safe", insurer: "Aura Travel Insurance", type: "travel", sumInsured: 100000, premium: 29, claimRatio: 97.3, features: ["Medical emergency", "Trip cancellation", "Baggage loss"] },
  ])
}

router.get("/plans", auth, async (req, res) => {
  try {
    await seedPlans()
    const query = { isActive: true }
    if (req.query.type) query.type = req.query.type
    const plans = await InsurancePlan.find(query)
    res.json({ plans })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get("/policies", auth, async (req, res) => {
  try {
    const policies = await InsurancePolicy.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ policies })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post("/apply", auth, async (req, res) => {
  try {
    const { planId, sumInsured, dob, gender, smoker, nominees } = req.body
    let plan = planId ? await InsurancePlan.findById(planId) : null
    const policyType = plan?.type || 'health'
    const policy = await InsurancePolicy.create({
      user: req.user._id, plan: plan?._id,
      planName: plan?.name || "Aura Insurance Policy",
      insurer: plan?.insurer || "Aura Insurance Group",
      type: policyType,
      sumInsured: parseFloat(sumInsured || plan?.sumInsured || 500000),
      premium: plan?.premium || 299,
      status: "active",
      dob: dob || null,
      gender: gender || null,
      smoker: smoker || false,
      nominees: Array.isArray(nominees) ? nominees : []
    })
    res.status(201).json({ message: "Policy issued successfully", policy })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get("/claims", auth, async (req, res) => {
  try {
    const claims = await InsuranceClaim.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ claims })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post("/claims", auth, async (req, res) => {
  try {
    const { policyId, description, amount } = req.body
    const claim = await InsuranceClaim.create({ user: req.user._id, policy: policyId, description, amount: parseFloat(amount) })
    res.status(201).json({ message: "Claim filed successfully", claim })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router