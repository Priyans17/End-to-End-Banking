import { useState, useEffect } from 'react'
import { PieChart, TrendingUp, Search, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Explore Funds', 'My Investments', 'SIP Manager', 'Start SIP']
const COLORS = ['#1e3a8a', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function MutualFunds() {
  const [tab, setTab] = useState('Explore Funds')
  const [funds, setFunds] = useState([])
  const [investments, setInvestments] = useState([])
  const [sips, setSips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const token = localStorage.getItem('aura_token')

  const fetchAll = () => {
    Promise.all([
      fetch('/api/mutual-funds/explore', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
      fetch('/api/mutual-funds/investments', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
      fetch('/api/mutual-funds/sips', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
    ]).then(([f, inv, s]) => {
      setFunds(f.funds || [])
      setInvestments(inv.investments || [])
      setSips(s.sips || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const categories = ['All', 'Large Cap', 'Mid Cap', 'Small Cap', 'ELSS', 'Debt', 'Hybrid', 'Index']
  const filtered = funds.filter(f =>
    (category === 'All' || f.category === category) &&
    (f.name?.toLowerCase().includes(search.toLowerCase()) || f.amc?.toLowerCase().includes(search.toLowerCase()))
  )

  const cancelSIP = async (sipId) => {
    try {
      const res = await fetch('/api/mutual-funds/sip/' + sipId + '/cancel', { method: 'PUT', headers: { Authorization: 'Bearer ' + token } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('SIP cancelled successfully')
      setSips(prev => prev.map(s => s._id === sipId ? { ...s, active: false } : s))
    } catch (e) { toast.error(e.message) }
  }

  const investLumpSum = async (fund) => {
    const amt = window.prompt('Enter lump sum amount (USD, min $10):', '100')
    if (!amt || isNaN(parseFloat(amt))) return
    try {
      const res = await fetch('/api/mutual-funds/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ fundId: fund._id, amount: parseFloat(amt), type: 'lumpsum' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Invested ' + fmt(amt) + ' in ' + fund.name)
      fetchAll()
    } catch (e) { toast.error(e.message) }
  }

  const tabStyle = (t) => ({
    padding: '14px 24px', border: 'none', background: 'transparent',
    fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    color: tab === t ? '#1e3a8a' : '#64748b',
    borderBottom: tab === t ? '2px solid #1e3a8a' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Mutual Funds</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Globally diversified funds with historical CAGR and NAV data</p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>)}
        </div>

        <div style={{ padding: 24 }}>
          {tab === 'Explore Funds' && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search funds..."
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{
                      padding: '8px 14px', borderRadius: 100, border: '1.5px solid ' + (category === c ? '#1e3a8a' : '#e2e8f0'),
                      background: category === c ? '#1e3a8a' : 'white', color: category === c ? 'white' : '#64748b',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist,sans-serif', whiteSpace: 'nowrap'
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading funds...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {filtered.map((fund, i) => (
                    <div key={i} style={{ border: '1.5px solid #f1f5f9', borderRadius: 14, padding: 20, background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>{fund.name}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{fund.amc}</div>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#eff6ff', color: '#1e3a8a', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{fund.category}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                        {[
                          { label: 'NAV', value: '$' + fund.nav?.toFixed(2) },
                          { label: '1Y CAGR', value: fund.cagr1y?.toFixed(1) + '%', color: fund.cagr1y >= 0 ? '#16a34a' : '#dc2626' },
                          { label: '3Y CAGR', value: fund.cagr3y?.toFixed(1) + '%', color: fund.cagr3y >= 0 ? '#16a34a' : '#dc2626' },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{m.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: m.color || '#0f172a' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setTab('Start SIP')} style={{ flex: 1, padding: '9px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist,sans-serif' }}>Start SIP</button>
                        <button onClick={() => investLumpSum(fund)} style={{ flex: 1, padding: '9px', background: 'white', color: '#1e3a8a', border: '1.5px solid #1e3a8a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist,sans-serif' }}>Lump Sum</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'My Investments' && (
            <div>
              {investments.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Portfolio Allocation</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <RechartsPie>
                        <Pie data={investments} dataKey="currentValue" nameKey="fundName" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => name?.slice(0, 12) + ' ' + (percent * 100).toFixed(0) + '%'}>
                          {investments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => [fmt(v), 'Value']} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Total Invested', value: fmt(investments.reduce((a, i) => a + (i.invested || 0), 0)) },
                      { label: 'Current Value', value: fmt(investments.reduce((a, i) => a + (i.currentValue || 0), 0)) },
                      { label: 'Total Returns', value: fmt(investments.reduce((a, i) => a + ((i.currentValue || 0) - (i.invested || 0)), 0)), color: '#16a34a' },
                    ].map(s => (
                      <div key={s.label} style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color || '#0f172a' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading...</div> : investments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No investments yet. Start your SIP or invest a lump sum today!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {investments.map((inv, i) => {
                    const pnl = (inv.currentValue || 0) - (inv.invested || 0)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{inv.fundName}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{inv.units?.toFixed(3)} units · NAV ${inv.nav?.toFixed(2)} · {inv.type}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{fmt(inv.currentValue)}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: pnl >= 0 ? '#16a34a' : '#dc2626' }}>{pnl >= 0 ? '+' : ''}{fmt(pnl)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'SIP Manager' && (
            <div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading SIPs...</div> : sips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No active SIPs. Start one today!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sips.map((sip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20, background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{sip.fundName}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{fmt(sip.amount)}/month · {sip.frequency} · Next: {sip.nextDate ? new Date(sip.nextDate).toLocaleDateString('en-US') : 'N/A'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>via {sip.mandate}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, background: sip.active ? '#dcfce7' : '#fee2e2', color: sip.active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                          {sip.active ? 'Active' : 'Cancelled'}
                        </span>
                        {sip.active && (
                          <button onClick={() => cancelSIP(sip._id)} style={{ padding: '5px 12px', background: 'white', border: '1px solid #fee2e2', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#dc2626', fontFamily: 'Urbanist,sans-serif' }}>
                            Cancel SIP
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Start SIP' && <StartSIPForm token={token} funds={funds} onSuccess={fetchAll} />}
        </div>
      </div>
    </div>
  )
}

function StartSIPForm({ token, funds, onSuccess }) {
  const [form, setForm] = useState({ fundName: '', amount: '', frequency: 'Monthly', startDate: '', mandate: 'Bank Transfer' })
  const [loading, setLoading] = useState(false)
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none' }
  const hint = { fontSize: 11, color: '#94a3b8', marginTop: 3 }

  const handleSIP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/mutual-funds/sip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('SIP registered successfully! Auto-debit mandate activated.')
      setForm({ fundName: '', amount: '', frequency: 'Monthly', startDate: '', mandate: 'Bank Transfer' })
      if (onSuccess) onSuccess()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Start a SIP</h3>
      <form onSubmit={handleSIP} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Fund Name</label>
          <select required value={form.fundName} onChange={e => setForm({ ...form, fundName: e.target.value })} style={inputStyle}>
            <option value="">Select a fund</option>
            {funds.map(f => <option key={f._id} value={f.name}>{f.name} ({f.category}) — NAV ${f.nav?.toFixed(2)}</option>)}
          </select>
          <div style={hint}>Choose from available funds — NAV shown for reference</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Monthly Amount ($)</label>
            <input type="number" required min="10" placeholder="e.g. 100" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
            <div style={hint}>Min: $10 · Amount debited monthly</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Frequency</label>
            <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={inputStyle}>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Weekly</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>SIP Start Date</label>
          <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
          <div style={hint}>First debit date (e.g. 2025-08-01)</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Auto-Pay Method</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Bank Transfer', 'Credit Card', 'Debit Card'].map(m => (
              <button key={m} type="button" onClick={() => setForm({ ...form, mandate: m })} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid ' + (form.mandate === m ? '#1e3a8a' : '#e2e8f0'),
                background: form.mandate === m ? '#eff6ff' : 'white', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, color: form.mandate === m ? '#1e3a8a' : '#64748b', fontFamily: 'Urbanist,sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                {form.mandate === m && <CheckCircle size={14} />} {m}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: 14, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', fontSize: 13, color: '#0369a1' }}>
          Your identity will be verified before investment. Auto-debit will be set up on your selected payment method.
        </div>
        <button type="submit" disabled={loading} style={{ padding: '13px', background: 'linear-gradient(135deg,#1e3a8a,#6366f1)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
          {loading ? 'Registering SIP...' : 'Start SIP'}
        </button>
      </form>
    </div>
  )
}
