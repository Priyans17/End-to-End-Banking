import { useState, useEffect, useCallback } from 'react'
import { Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = ['Compare Plans', 'My Policies', 'Apply']
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function Insurance() {
  const [tab, setTab] = useState('Compare Plans')
  const [plans, setPlans] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [insuranceType, setInsuranceType] = useState('health')
  const token = localStorage.getItem('aura_token')

  const fetchPolicies = useCallback(() => {
    fetch('/api/insurance/policies', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => setPolicies(d.policies || []))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    const h = { Authorization: 'Bearer ' + token }
    setLoading(true)
    Promise.all([
      fetch('/api/insurance/plans?type=' + insuranceType, { headers: h }).then(r => r.json()),
      fetch('/api/insurance/policies', { headers: h }).then(r => r.json()),
    ]).then(([p, pol]) => {
      setPlans(p.plans || [])
      setPolicies(pol.policies || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [insuranceType])

  const types = [
    { value: 'health', label: 'Health' },
    { value: 'life', label: 'Life' },
    { value: 'motor', label: 'Motor' },
    { value: 'home', label: 'Home' },
    { value: 'travel', label: 'Travel' },
  ]

  const tabStyle = (t) => ({
    padding: '12px 20px', border: 'none', background: 'transparent',
    fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    color: tab === t ? '#1e3a8a' : '#6b7280',
    borderBottom: tab === t ? '2px solid #1e3a8a' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  const handlePolicyCreated = () => {
    fetchPolicies()
    setTab('My Policies')
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Insurance</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Compare, purchase, and manage your insurance policies</p>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>)}
        </div>

        <div style={{ padding: 20 }}>
          {tab === 'Compare Plans' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {types.map(t => (
                  <button key={t.value} onClick={() => setInsuranceType(t.value)} style={{ padding: '7px 16px', borderRadius: 100, border: '1px solid ' + (insuranceType === t.value ? '#1e3a8a' : '#e5e7eb'), background: insuranceType === t.value ? '#1e3a8a' : 'white', color: insuranceType === t.value ? 'white' : '#6b7280', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist,sans-serif' }}>{t.label}</button>
                ))}
              </div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading plans...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {plans.map((plan, i) => (
                    <div key={i} style={{ border: '1px solid ' + (plan.recommended ? '#1e3a8a' : '#e5e7eb'), borderRadius: 10, padding: 20, background: plan.recommended ? '#f8faff' : 'white', position: 'relative' }}>
                      {plan.recommended && (
                        <div style={{ position: 'absolute', top: -10, left: 16, background: '#1e3a8a', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 100 }}>RECOMMENDED</div>
                      )}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{plan.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{plan.insurer}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[
                          { label: 'Coverage', value: fmt(plan.sumInsured) },
                          { label: 'Annual Premium', value: fmt(plan.premium) },
                          { label: 'Claim Ratio', value: plan.claimRatio + '%', color: plan.claimRatio >= 95 ? '#16a34a' : '#f59e0b' },
                          { label: 'Network', value: plan.networkHospitals ? plan.networkHospitals.toLocaleString() + ' hospitals' : 'Worldwide' },
                        ].map(m => (
                          <div key={m.label} style={{ padding: 10, background: '#f9fafb', borderRadius: 6 }}>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: m.color || '#111827' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      {plan.features && (
                        <div style={{ marginBottom: 14 }}>
                          {plan.features.slice(0, 3).map((f, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                              <CheckCircle size={12} color="#16a34a" />
                              <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setTab('Apply')} style={{ width: '100%', padding: '10px', background: plan.recommended ? '#1e3a8a' : 'white', color: plan.recommended ? 'white' : '#1e3a8a', border: '1px solid #1e3a8a', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist,sans-serif' }}>
                        Get Quote — {fmt(plan.premium)}/yr
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'My Policies' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</div>
              ) : policies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                  <Shield size={40} color="#e5e7eb" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No active policies</p>
                  <p style={{ fontSize: 13, marginBottom: 16 }}>Compare plans and get covered today</p>
                  <button onClick={() => setTab('Apply')} style={{ padding: '10px 24px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Urbanist,sans-serif' }}>Apply Now</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {policies.map((pol, i) => (
                    <div key={i} style={{ padding: 18, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{pol.planName}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>Policy No: {pol.policyNumber} · {pol.insurer}</div>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: pol.status === 'active' ? '#f0fdf4' : '#fef2f2', color: pol.status === 'active' ? '#16a34a' : '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>{pol.status}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                        {[
                          { label: 'Coverage', value: fmt(pol.sumInsured) },
                          { label: 'Premium', value: fmt(pol.premium) + '/yr' },
                          { label: 'Valid Until', value: pol.expiryDate ? new Date(pol.expiryDate).toLocaleDateString() : 'N/A' },
                          { label: 'Type', value: pol.type }
                        ].map(m => (
                          <div key={m.label} style={{ padding: 10, background: 'white', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Apply' && <InsuranceApplyForm token={token} onSuccess={handlePolicyCreated} />}
        </div>
      </div>
    </div>
  )
}

function InsuranceApplyForm({ token, onSuccess }) {
  const [step, setStep] = useState(1)
  const [insuranceType, setInsuranceType] = useState('health')
  const [planId, setPlanId] = useState('')
  const [sumInsured, setSumInsured] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [smoker, setSmoker] = useState(false)
  const [nomineeName, setNomineeName] = useState('')
  const [availablePlans, setAvailablePlans] = useState([])
  const [loading, setLoading] = useState(false)

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', boxSizing: 'border-box' }

  useEffect(() => {
    fetch('/api/insurance/plans?type=' + insuranceType, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => {
        const plans = d.plans || []
        setAvailablePlans(plans)
        if (plans.length > 0) {
          setPlanId(plans[0]._id)
          setSumInsured(String(plans[0].sumInsured))
        }
      })
      .catch(() => {})
  }, [insuranceType])

  const handleApply = async (e) => {
    e.preventDefault()
    if (step < 3) { setStep(step + 1); return }
    setLoading(true)
    try {
      const res = await fetch('/api/insurance/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ planId, type: insuranceType, sumInsured, dob, gender, smoker, nominees: nomineeName ? [{ name: nomineeName, relation: 'Beneficiary', share: 100 }] : [] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Policy issued successfully!')
      setStep(1); setDob(''); setGender(''); setSmoker(false); setNomineeName('')
      if (onSuccess) onSuccess()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const steps = ['Plan Details', 'Personal Info', 'Review']
  const selectedPlan = availablePlans.find(p => p._id === planId)

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Apply for Insurance</h3>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i+1 ? '#16a34a' : step === i+1 ? '#1e3a8a' : '#e5e7eb', color: step >= i+1 ? 'white' : '#9ca3af', fontWeight: 700, fontSize: 12 }}>
                {step > i+1 ? <CheckCircle size={13} /> : i+1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step === i+1 ? '#111827' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: step > i+1 ? '#16a34a' : '#e5e7eb', margin: '0 10px' }} />}
          </div>
        ))}
      </div>
      <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step === 1 && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Insurance Type</label>
              <select value={insuranceType} onChange={e => setInsuranceType(e.target.value)} style={inp}>
                <option value="health">Health Insurance</option>
                <option value="life">Life Insurance</option>
                <option value="motor">Motor Insurance</option>
                <option value="home">Home Insurance</option>
                <option value="travel">Travel Insurance</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Select Plan</label>
              <select value={planId} onChange={e => { const plan = availablePlans.find(p => p._id === e.target.value); setPlanId(e.target.value); if (plan) setSumInsured(String(plan.sumInsured)) }} required style={inp}>
                <option value="">Select a plan</option>
                {availablePlans.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({fmt(p.sumInsured)} coverage · {fmt(p.premium)}/yr)</option>
                ))}
              </select>
              {availablePlans.length === 0 && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Loading plans...</div>}
            </div>
            {selectedPlan && (
              <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 13, color: '#0369a1' }}>
                <strong>{selectedPlan.name}</strong> — {fmt(selectedPlan.sumInsured)} coverage · {fmt(selectedPlan.premium)}/yr · Claim ratio: {selectedPlan.claimRatio}%
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Date of Birth</label>
                <input type="date" required value={dob} onChange={e => setDob(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Gender</label>
                <select required value={gender} onChange={e => setGender(e.target.value)} style={inp}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Beneficiary / Nominee</label>
              <input placeholder="e.g. Jane Smith" value={nomineeName} onChange={e => setNomineeName(e.target.value)} style={inp} />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Full legal name of your beneficiary</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
              <input type="checkbox" checked={smoker} onChange={e => setSmoker(e.target.checked)} style={{ accentColor: '#1e3a8a', width: 15, height: 15 }} />
              I am a current tobacco / nicotine user
            </label>
          </>
        )}
        {step === 3 && (
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Application Summary</h4>
            {[
              { label: 'Plan', value: selectedPlan?.name || 'N/A' },
              { label: 'Type', value: insuranceType },
              { label: 'Coverage', value: fmt(parseInt(sumInsured || 0)) },
              { label: 'Premium', value: selectedPlan ? fmt(selectedPlan.premium) + '/yr' : 'N/A' },
              { label: 'Date of Birth', value: dob },
              { label: 'Gender', value: gender },
              { label: 'Tobacco User', value: smoker ? 'Yes' : 'No' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: 10, background: '#fefce8', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
              A 15-day free-look period applies. You may cancel within this period for a full refund.
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 1 && <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '11px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, color: '#374151' }}>Back</button>}
          <button type="submit" disabled={loading} style={{ flex: 2, padding: '11px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting...' : step < 3 ? 'Continue' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  )
}
