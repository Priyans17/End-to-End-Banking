import { useState, useEffect, useCallback } from 'react'
import { ArrowUpRight, ArrowDownRight, Plus, Download, Search, CreditCard, Send, Zap, Lock, Unlock, FileText, RefreshCw, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)
const TABS = ['Accounts', 'Transfer', 'Beneficiaries', 'Bill Pay', 'Cards', 'Statements']
const inp = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', boxSizing: 'border-box' }
const hint = { fontSize: 11, color: '#9ca3af', marginTop: 3 }

const ACC_GRADIENTS = {
  savings: 'linear-gradient(135deg, #1e3a8a 0%, #3b5fc0 100%)',
  current: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
  fixed_deposit: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
}

export default function Banking() {
  const [tab, setTab] = useState('Accounts')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [hideBalance, setHideBalance] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const token = localStorage.getItem('aura_token')

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    const h = { Authorization: 'Bearer ' + token }
    try {
      const [a, t, b] = await Promise.all([
        fetch('/api/banking/accounts', { headers: h }).then(r => r.json()).catch(() => ({ accounts: [] })),
        fetch('/api/banking/transactions?limit=50', { headers: h }).then(r => r.json()).catch(() => ({ transactions: [] })),
        fetch('/api/banking/beneficiaries', { headers: h }).then(r => r.json()).catch(() => ({ beneficiaries: [] })),
      ])
      setAccounts(a.accounts || [])
      setTransactions(t.transactions || [])
      setBeneficiaries(b.beneficiaries || [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) || tx.mode?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || tx.type === filterType
    return matchSearch && matchType
  })

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)
  const todayTx = transactions.filter(tx => new Date(tx.date).toDateString() === new Date().toDateString())
  const todayIn = todayTx.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const todayOut = todayTx.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const tabStyle = (t) => ({
    padding: '12px 18px', border: 'none', background: 'transparent',
    fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: tab === t ? '#1e3a8a' : '#6b7280',
    borderBottom: tab === t ? '2px solid #1e3a8a' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Banking</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Manage your accounts, transfers, and payments</p>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'Urbanist,sans-serif' }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Balance', value: fmt(totalBalance), sub: `${accounts.length} account${accounts.length !== 1 ? 's' : ''}`, color: '#1e3a8a' },
          { label: "Today's Credits", value: fmt(todayIn), sub: `${todayTx.filter(t => t.type === 'credit').length} transactions`, color: '#16a34a' },
          { label: "Today's Debits", value: fmt(todayOut), sub: `${todayTx.filter(t => t.type === 'debit').length} transactions`, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Account Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {loading ? (
          <div style={{ background: 'white', borderRadius: 10, padding: 24, textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>Loading accounts...</div>
        ) : accounts.map(acc => {
          const lastTx = transactions.find(tx => tx.account === acc._id || true)
          return (
            <div key={acc._id} style={{ borderRadius: 16, padding: 24, background: ACC_GRADIENTS[acc.type] || ACC_GRADIENTS.savings, color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative' }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{acc.type.replace('_', ' ')} Account</div>
                  <div style={{ fontSize: 13, opacity: 0.8, letterSpacing: 2, fontWeight: 500 }}>**** **** **** {acc.accountNumber?.slice(-4)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setHideBalance(!hideBalance)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.7, padding: 4 }}>
                    {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <CreditCard size={22} opacity={0.5} />
                </div>
              </div>
              <div style={{ marginBottom: 20, position: 'relative' }}>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Available Balance</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>
                  {hideBalance ? '••••••' : fmt(acc.balance)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: 9, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>Account Holder</div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>AURA MEMBER</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>Account No.</div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{acc.accountNumber}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>)}
        </div>
        <div style={{ padding: 20 }}>
          {tab === 'Accounts' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
                    style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['all', 'credit', 'debit'].map(f => (
                    <button key={f} onClick={() => setFilterType(f)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid ' + (filterType === f ? '#1e3a8a' : '#e5e7eb'), background: filterType === f ? '#1e3a8a' : 'white', color: filterType === f ? 'white' : '#6b7280', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Urbanist,sans-serif', textTransform: 'capitalize' }}>{f}</button>
                  ))}
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'Urbanist,sans-serif' }}>
                  <Download size={13} /> Export
                </button>
              </div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</div> :
                filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No transactions found</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filtered.map((tx, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 8px', borderBottom: '1px solid #f9fafb', borderRadius: 6, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2', flexShrink: 0 }}>
                          {tx.type === 'credit' ? <ArrowDownRight size={17} color="#16a34a" /> : <ArrowUpRight size={17} color="#dc2626" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                            <span style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, marginRight: 6, fontWeight: 600 }}>{tx.mode}</span>
                            {new Date(tx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                            {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Bal: {fmt(tx.balance)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {tab === 'Transfer' && <TransferForm token={token} accounts={accounts} onSuccess={() => fetchAll(true)} />}
          {tab === 'Beneficiaries' && <Beneficiaries token={token} beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} />}
          {tab === 'Bill Pay' && <BillPay token={token} onSuccess={() => fetchAll(true)} />}
          {tab === 'Cards' && <Cards accounts={accounts} token={token} />}
          {tab === 'Statements' && <Statements token={token} />}
        </div>
      </div>
    </div>
  )
}

function TransferForm({ token, accounts, onSuccess }) {
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '', mode: 'SWIFT', remarks: '' })
  const [loading, setLoading] = useState(false)

  const handleTransfer = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/banking/transfer', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Transfer of ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(form.amount)} initiated via ${form.mode}`)
      setForm({ fromAccount: '', toAccount: '', amount: '', mode: 'SWIFT', remarks: '' })
      onSuccess()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const selectedAcc = accounts.find(a => a._id === form.fromAccount)

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Fund Transfer</h3>
      <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>From Account</label>
          <select value={form.fromAccount} onChange={e => setForm({...form, fromAccount: e.target.value})} required style={inp}>
            <option value="">Select account</option>
            {accounts.map(a => <option key={a._id} value={a._id}>{a.type.replace('_',' ')} — ****{a.accountNumber?.slice(-4)} · {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(a.balance)}</option>)}
          </select>
          {selectedAcc && <div style={hint}>Available: {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(selectedAcc.balance)}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>To Account / IBAN</label>
          <input type="text" required placeholder="e.g. GB29NWBK60161331926819" value={form.toAccount} onChange={e => setForm({...form, toAccount: e.target.value})} style={inp} />
          <div style={hint}>IBAN (e.g. GB29NWBK60161331926819) or 10-digit account number</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Amount (USD)</label>
            <input type="number" required min="1" step="0.01" placeholder="e.g. 500.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={inp} />
            <div style={hint}>Min: $1.00 · Max: {selectedAcc ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(selectedAcc.balance) : 'your balance'}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Method</label>
            <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} style={inp}>
              <option>SWIFT</option>
              <option>SEPA</option>
              <option>ACH</option>
              <option>Wire Transfer</option>
              <option>Instant</option>
            </select>
            <div style={hint}>SWIFT: international · SEPA: EU · ACH: US domestic</div>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Reference / Remarks</label>
          <input type="text" placeholder="e.g. Rent Jan 2025 or Invoice #1042" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} style={inp} />
          <div style={hint}>Optional note for the recipient (max 100 characters)</div>
        </div>
        <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div><strong>SWIFT</strong> — International wire, 1-3 days</div>
          <div><strong>SEPA</strong> — EU zone, same day</div>
          <div><strong>ACH</strong> — US domestic, 1-2 days</div>
          <div><strong>Instant</strong> — Real-time, 24/7</div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '12px', background: loading ? '#6b7280' : '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Send size={15} /> {loading ? 'Processing...' : 'Initiate Transfer'}
        </button>
      </form>
    </div>
  )
}

function Beneficiaries({ token, beneficiaries, setBeneficiaries }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', accountNumber: '', ifsc: '', bank: '', nickname: '' })

  const addBeneficiary = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/banking/beneficiaries', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Beneficiary added. 24-hour activation period applies.')
      setBeneficiaries([...beneficiaries, data.beneficiary])
      setShowAdd(false)
      setForm({ name: '', accountNumber: '', ifsc: '', bank: '', nickname: '' })
    } catch (err) { toast.error(err.message) }
  }

  const fi = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }
  const fh = { fontSize: 10, color: '#9ca3af', marginTop: 2 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Saved Beneficiaries</h3>
        <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600 }}>
          <Plus size={14} /> Add Beneficiary
        </button>
      </div>
      {showAdd && (
        <form onSubmit={addBeneficiary} style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Full Name</label>
              <input required placeholder="e.g. John Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={fi} />
              <div style={fh}>Recipient's full legal name</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nickname</label>
              <input placeholder="e.g. Mom, Landlord" value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} style={fi} />
              <div style={fh}>Optional short label for easy identification</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Account / IBAN</label>
              <input required placeholder="e.g. GB29NWBK60161331926819" value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} style={fi} />
              <div style={fh}>IBAN or 10-digit account number</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Routing / SWIFT / BIC</label>
              <input required placeholder="e.g. NWBKGB2L or 021000021" value={form.ifsc} onChange={e => setForm({...form, ifsc: e.target.value.toUpperCase()})} style={fi} />
              <div style={fh}>SWIFT/BIC (e.g. NWBKGB2L) or US routing number (9 digits)</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Bank Name</label>
              <input required placeholder="e.g. Barclays, Chase, HSBC" value={form.bank} onChange={e => setForm({...form, bank: e.target.value})} style={fi} />
              <div style={fh}>Full name of the recipient's bank</div>
            </div>
          </div>
          <div style={{ padding: 10, background: '#fefce8', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
            Security: 24-hour activation period applies. Email confirmation will be sent.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '9px 18px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600 }}>Add</button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600, color: '#374151' }}>Cancel</button>
          </div>
        </form>
      )}
      {beneficiaries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No beneficiaries added yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {beneficiaries.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ width: 40, height: 40, background: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{b.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{b.name} {b.nickname && <span style={{ fontSize: 11, color: '#9ca3af' }}>({b.nickname})</span>}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{b.bank} · ****{b.accountNumber?.slice(-4)} · {b.ifsc}</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: b.active ? '#f0fdf4' : '#fefce8', color: b.active ? '#16a34a' : '#92400e', fontWeight: 700 }}>
                {b.active ? 'Active' : 'Pending (24h)'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BillPay({ token, onSuccess }) {
  const [form, setForm] = useState({ category: 'electricity', provider: '', consumerId: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const handlePay = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/banking/bill-pay', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('aura_token') },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Bill payment successful')
      setForm({ category: 'electricity', provider: '', consumerId: '', amount: '' })
      onSuccess()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }
  const categories = ['electricity', 'water', 'internet', 'gas', 'property_tax', 'mobile']
  const inp2 = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none' }
  return (
    <div style={{ maxWidth: 460 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Pay Bills</h3>
      <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Category</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {categories.map(c => (
              <button key={c} type="button" onClick={() => setForm({...form, category: c})} style={{ padding: '9px 8px', borderRadius: 6, border: '1px solid ' + (form.category === c ? '#1e3a8a' : '#e5e7eb'), background: form.category === c ? '#eff6ff' : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.category === c ? '#1e3a8a' : '#6b7280', fontFamily: 'Urbanist,sans-serif', textTransform: 'capitalize' }}>{c.replace('_', ' ')}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Provider</label>
          <input required placeholder="e.g. National Grid, Comcast, AT&T" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} style={inp2} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Name of your utility or service provider</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Account / Consumer ID</label>
          <input required placeholder="e.g. 4521-8832-001" value={form.consumerId} onChange={e => setForm({...form, consumerId: e.target.value})} style={inp2} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Found on your bill (e.g. 4521-8832-001)</div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Amount (USD)</label>
          <input type="number" required min="1" step="0.01" placeholder="e.g. 120.50" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={inp2} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Min: $1.00 · Enter exact amount from your bill</div>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '11px', background: loading ? '#6b7280' : '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Zap size={15} /> {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  )
}

function Cards({ accounts, token }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [reqForm, setReqForm] = useState({ cardType: 'debit', network: 'Visa', isVirtual: false })
  const [requesting, setRequesting] = useState(false)

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/banking/cards', { headers: { Authorization: 'Bearer ' + token } })
      const data = await res.json()
      setCards(data.cards || [])
    } catch(e) {} finally { setLoading(false) }
  }

  useEffect(() => { fetchCards() }, [])

  const removeCard = async (cardId) => {
    if (!window.confirm('Remove this card? This cannot be undone.')) return
    try {
      const res = await fetch('/api/banking/cards/' + cardId, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setCards(prev => prev.filter(c => c._id !== cardId))
    } catch(e) { toast.error(e.message) }
  }

  const toggleLock = async (cardId) => {
    try {
      const res = await fetch('/api/banking/cards/' + cardId + '/toggle-lock', { method: 'PUT', headers: { Authorization: 'Bearer ' + token } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setCards(prev => prev.map(c => c._id === cardId ? data.card : c))
    } catch(e) { toast.error(e.message) }
  }

  const requestCard = async (e) => {
    e.preventDefault()
    setRequesting(true)
    try {
      const res = await fetch('/api/banking/cards/request', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(reqForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      setCards(prev => [...prev, data.card])
      setShowRequest(false)
      setReqForm({ cardType: 'debit', network: 'Visa', isVirtual: false })
    } catch(e) { toast.error(e.message) }
    finally { setRequesting(false) }
  }

  const CARD_COLORS = { debit: 'linear-gradient(135deg,#1e3a8a,#3b5fc0)', credit: 'linear-gradient(135deg,#111827,#374151)', prepaid: 'linear-gradient(135deg,#065f46,#059669)', virtual: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }
  const inp2 = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading cards...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Card Management</h3>
        <button onClick={() => setShowRequest(!showRequest)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600 }}>
          <Plus size={14} /> Request Card
        </button>
      </div>

      {showRequest && (
        <form onSubmit={requestCard} style={{ background: '#f9fafb', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Request New Card</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Card Type</label>
              <select value={reqForm.cardType} onChange={e => setReqForm({...reqForm, cardType: e.target.value})} style={inp2}>
                <option value="debit">Debit Card</option>
                <option value="credit">Credit Card</option>
                <option value="prepaid">Prepaid Card</option>
                <option value="virtual">Virtual Card</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Network</label>
              <select value={reqForm.network} onChange={e => setReqForm({...reqForm, network: e.target.value})} style={inp2}>
                <option>Visa</option>
                <option>Mastercard</option>
                <option>Amex</option>
                <option>Discover</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                <input type="checkbox" checked={reqForm.isVirtual} onChange={e => setReqForm({...reqForm, isVirtual: e.target.checked, cardType: e.target.checked ? 'virtual' : reqForm.cardType})} style={{ accentColor: '#1e3a8a' }} />
                Virtual Card (instant)
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={requesting} style={{ padding: '9px 20px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600 }}>{requesting ? 'Requesting...' : 'Submit Request'}</button>
            <button type="button" onClick={() => setShowRequest(false)} style={{ padding: '9px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600, color: '#374151' }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {cards.map(card => (
          <div key={card._id} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
            <div>
              <div style={{ borderRadius: 16, padding: 22, background: CARD_COLORS[card.cardType] || CARD_COLORS.debit, color: 'white', position: 'relative', overflow: 'hidden', opacity: card.status === 'locked' ? 0.7 : 1 }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>{card.cardType} {card.isVirtual ? '(Virtual)' : ''}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{card.network}</div>
                  </div>
                  {card.status === 'locked' && <span style={{ fontSize: 10, background: 'rgba(220,38,38,0.8)', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>LOCKED</span>}
                  {card.status === 'pending' && <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.8)', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>PENDING</span>}
                </div>
                <div style={{ fontSize: 16, letterSpacing: 3, fontWeight: 600, marginBottom: 18 }}>**** **** **** {card.last4}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 9, opacity: 0.6 }}>CARD HOLDER</div><div style={{ fontWeight: 700, fontSize: 12 }}>{card.cardHolder}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 9, opacity: 0.6 }}>EXPIRES</div><div style={{ fontWeight: 700, fontSize: 12 }}>{String(card.expiryMonth).padStart(2,'0')}/{String(card.expiryYear).slice(-2)}</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button onClick={() => toggleLock(card._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 6, border: '1px solid ' + (card.status === 'locked' ? '#16a34a' : '#dc2626'), background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: card.status === 'locked' ? '#16a34a' : '#dc2626', fontFamily: 'Urbanist,sans-serif' }}>
                  {card.status === 'locked' ? <Unlock size={12} /> : <Lock size={12} />} {card.status === 'locked' ? 'Unlock' : 'Lock'}
                </button>
                <button onClick={() => toast.success('PIN change OTP sent to your email')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'Urbanist,sans-serif' }}>Change PIN</button>
                <button onClick={() => removeCard(card._id)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #fee2e2', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626', fontFamily: 'Urbanist,sans-serif' }}>Remove</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Daily Limit', value: '$' + card.dailyLimit?.toLocaleString(), sub: 'Resets at midnight UTC' },
                { label: 'Monthly Limit', value: '$' + card.monthlyLimit?.toLocaleString(), sub: 'Resets on 1st of month' },
                { label: 'International', value: card.internationalEnabled ? 'Enabled' : 'Disabled', color: card.internationalEnabled ? '#16a34a' : '#dc2626', sub: '180+ countries' },
                { label: 'Contactless / NFC', value: card.contactlessEnabled ? 'Enabled' : 'Disabled', color: card.contactlessEnabled ? '#16a34a' : '#dc2626', sub: 'Apple Pay / Google Pay' },
                { label: 'Online Transactions', value: card.onlineEnabled ? 'Enabled' : 'Disabled', color: card.onlineEnabled ? '#16a34a' : '#dc2626', sub: '3D Secure' },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{item.sub}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color || '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


function Statements({ token }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState('pdf')

  const download = async () => {
    if (!from || !to) { toast.error('Please select both dates'); return }
    setLoading(true)
    try {
      const endpoint = format === 'pdf' ? '/api/banking/statement/pdf' : '/api/banking/statement/excel'
      const res = await fetch(endpoint + '?from=' + from + '&to=' + to, {
        headers: { Authorization: 'Bearer ' + token }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Download failed' }))
        throw new Error(err.message)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'aura-statement-' + from + '-to-' + to + (format === 'pdf' ? '.pdf' : '.xlsx')
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Statement downloaded as ' + format.toUpperCase())
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const si = { padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', width: '100%' }

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 18 }}>Download Statement</h3>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={si} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Start date of statement period</div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={si} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>End date (max range: 12 months)</div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Format</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ id: 'pdf', label: 'PDF', desc: 'Branded PDF with Aura design' }, { id: 'excel', label: 'Excel (.xlsx)', desc: 'Spreadsheet with all transactions' }].map(f => (
            <button key={f.id} type="button" onClick={() => setFormat(f.id)} style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1.5px solid ' + (format === f.id ? '#1e3a8a' : '#e5e7eb'), background: format === f.id ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: format === f.id ? '#1e3a8a' : '#374151' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{f.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 12, color: '#0369a1', marginBottom: 16 }}>
        Statement includes all transactions in the selected date range with running balance.
      </div>
      <button onClick={download} disabled={!from || !to || loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: (!from || !to || loading) ? '#9ca3af' : '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, cursor: (!from || !to || loading) ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 700, width: '100%', justifyContent: 'center' }}>
        <FileText size={15} /> {loading ? 'Generating...' : 'Download ' + format.toUpperCase() + ' Statement'}
      </button>
    </div>
  )
}