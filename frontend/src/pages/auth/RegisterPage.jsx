
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const COUNTRY_CODES = [
  { code: '+1', label: 'US/CA +1' }, { code: '+44', label: 'UK +44' },
  { code: '+49', label: 'DE +49' }, { code: '+33', label: 'FR +33' },
  { code: '+39', label: 'IT +39' }, { code: '+34', label: 'ES +34' },
  { code: '+31', label: 'NL +31' }, { code: '+41', label: 'CH +41' },
  { code: '+46', label: 'SE +46' }, { code: '+47', label: 'NO +47' },
  { code: '+45', label: 'DK +45' }, { code: '+61', label: 'AU +61' },
  { code: '+65', label: 'SG +65' }, { code: '+81', label: 'JP +81' },
  { code: '+91', label: 'IN +91' }, { code: '+971', label: 'UAE +971' },
  { code: '+27', label: 'ZA +27' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', countryCode: '+1', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password }
      if (form.phone) {
        payload.phone = parseInt(form.phone.replace(/\D/g, ''))
        payload.countryCode = form.countryCode
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      login(data.user, data.token)
      toast.success('Account created successfully')
      navigate('/dashboard')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', color: '#111827', background: 'white' }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={17} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#111827', fontFamily: 'Urbanist,sans-serif' }}>Aura</span>
          </Link>
        </div>
        <div style={{ background: 'white', borderRadius: 10, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4, textAlign: 'center' }}>Create an account</h1>
          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>Start banking with Aura today</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Full Name</label>
              <input type="text" required placeholder="John Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email Address</label>
              <input type="email" required placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Phone <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={form.countryCode} onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{ padding: '10px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none', background: 'white', color: '#111827', minWidth: 100 }}>
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input type="tel" placeholder="Digits only" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'')})} style={{...inp, flex:1}} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} required placeholder="Minimum 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{...inp, paddingRight: 40}} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '11px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6b7280' }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#9ca3af' }}>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  )
}
