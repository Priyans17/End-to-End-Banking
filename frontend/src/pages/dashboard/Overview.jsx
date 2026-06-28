import { useState, useEffect } from 'react'
import { Landmark, TrendingUp, PieChart, Shield, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../context/AuthContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

const portfolioData = [
  { month: 'Jan', value: 820000 }, { month: 'Feb', value: 845000 },
  { month: 'Mar', value: 832000 }, { month: 'Apr', value: 868000 },
  { month: 'May', value: 891000 }, { month: 'Jun', value: 912000 },
  { month: 'Jul', value: 898000 }, { month: 'Aug', value: 934000 },
  { month: 'Sep', value: 958000 }, { month: 'Oct', value: 972000 },
  { month: 'Nov', value: 989000 }, { month: 'Dec', value: 1012000 },
]

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function Overview() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('aura_token')
    const h = { Authorization: 'Bearer ' + token }
    Promise.all([
      fetch('/api/banking/summary', { headers: h }).then(r => r.json()),
      fetch('/api/banking/transactions?limit=5', { headers: h }).then(r => r.json()),
    ]).then(([s, t]) => {
      setSummary(s)
      setTransactions(t.transactions || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Here is your financial overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Account Balance" value={loading ? '...' : fmt(summary?.savingsBalance || 250000)} subtitle="Primary account" icon={Landmark} color="#1e3a8a" trend={2.4} />
        <StatCard title="Portfolio Value" value={loading ? '...' : fmt(summary?.portfolioValue || 1012000)} subtitle="Investments" icon={TrendingUp} color="#6366f1" trend={5.8} />
        <StatCard title="Funds Invested" value={loading ? '...' : fmt(summary?.mfInvested || 340000)} subtitle="Active plans" icon={PieChart} color="#10b981" trend={3.2} />
        <StatCard title="Insurance Cover" value={loading ? '...' : fmt(summary?.insuranceCover || 2000000)} subtitle="Total coverage" icon={Shield} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => ['$' + v.toLocaleString(), 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#1e3a8a" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Transactions</h3>
            <Link to="/dashboard/banking" style={{ fontSize: 12, color: '#1e3a8a', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
          </div>
          {loading ? (
            <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 32 }}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 32 }}>No transactions yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.map((tx, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2', flexShrink: 0 }}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={14} color="#16a34a" /> : <ArrowUpRight size={14} color="#dc2626" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(tx.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'credit' ? '#16a34a' : '#dc2626', flexShrink: 0 }}>
                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Send Money', icon: ArrowUpRight, color: '#1e3a8a', href: '/dashboard/banking' },
            { label: 'Pay Bills', icon: CreditCard, color: '#6366f1', href: '/dashboard/banking' },
            { label: 'Trade', icon: TrendingUp, color: '#10b981', href: '/dashboard/trading' },
            { label: 'Invest', icon: PieChart, color: '#f59e0b', href: '/dashboard/mutual-funds' },
            { label: 'Wallet', icon: Wallet, color: '#8b5cf6', href: '/dashboard/banking' },
          ].map(({ label, icon: Icon, color, href }) => (
            <Link key={label} to={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 20px', borderRadius: 8, border: '1px solid #f3f4f6', textDecoration: 'none', background: '#fafafa', minWidth: 90 }}
              onMouseEnter={e => { e.currentTarget.style.background = color + '10'; e.currentTarget.style.borderColor = color + '40' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f3f4f6' }}>
              <div style={{ width: 36, height: 36, background: color + '15', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}