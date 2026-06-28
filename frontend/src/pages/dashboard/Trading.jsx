import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Market Watch', 'My Portfolio', 'Orders', 'Place Order']
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0)

export default function Trading() {
  const [tab, setTab] = useState('Market Watch')
  const [stocks, setStocks] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('aura_token')

  const fetchData = () => {
    const h = { Authorization: 'Bearer ' + token }
    Promise.all([
      fetch('/api/trading/market-watch', { headers: h }).then(r => r.json()),
      fetch('/api/trading/portfolio', { headers: h }).then(r => r.json()),
      fetch('/api/trading/orders', { headers: h }).then(r => r.json()),
    ]).then(([m, p, o]) => {
      setStocks(m.stocks || [])
      setPortfolio(p.holdings || [])
      setOrders(o.orders || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const filtered = stocks.filter(s =>
    s.symbol?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase())
  )

  const tabStyle = (t) => ({
    padding: '12px 20px', border: 'none', background: 'transparent',
    fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    color: tab === t ? '#1e3a8a' : '#6b7280',
    borderBottom: tab === t ? '2px solid #1e3a8a' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Equity Trading</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Global markets — NYSE, NASDAQ, LSE, Euronext</p>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>)}
        </div>

        <div style={{ padding: 20 }}>
          {tab === 'Market Watch' && (
            <div>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by symbol or company name..."
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
              </div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading market data...</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Symbol', 'Company', 'Exchange', 'Price', 'Change', 'Change %', 'Volume', ''].map(h => (
                          <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '11px 12px', fontWeight: 700, color: '#111827', fontSize: 13 }}>{s.symbol}</td>
                          <td style={{ padding: '11px 12px', fontSize: 13, color: '#6b7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</td>
                          <td style={{ padding: '11px 12px' }}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#1e3a8a', fontWeight: 700 }}>{s.exchange}</span></td>
                          <td style={{ padding: '11px 12px', fontWeight: 700, fontSize: 13 }}>{fmt(s.ltp)}</td>
                          <td style={{ padding: '11px 12px', color: s.change >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: 13 }}>
                            {s.change >= 0 ? '+' : ''}{fmt(s.change)}
                          </td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: s.changePct >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: 12 }}>
                              {s.changePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {s.changePct >= 0 ? '+' : ''}{s.changePct?.toFixed(2)}%
                            </span>
                          </td>
                          <td style={{ padding: '11px 12px', fontSize: 12, color: '#9ca3af' }}>{s.volume?.toLocaleString()}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <button onClick={() => setTab('Place Order')} style={{ padding: '5px 12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Urbanist,sans-serif' }}>Trade</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'My Portfolio' && (
            <div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading portfolio...</div> : portfolio.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                  <TrendingUp size={40} color="#e5e7eb" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No holdings yet</p>
                  <p style={{ fontSize: 13 }}>Start trading to build your portfolio</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Symbol', 'Qty', 'Avg Price', 'Current Price', 'Invested', 'Current Value', 'P&L', 'Return'].map(h => (
                          <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((h, i) => {
                        const invested = h.qty * h.avgPrice
                        const current = h.qty * h.ltp
                        const pnl = current - invested
                        const pnlPct = ((pnl / invested) * 100).toFixed(2)
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                            <td style={{ padding: '11px 12px', fontWeight: 700, color: '#111827' }}>{h.symbol}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13 }}>{h.qty}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13 }}>{fmt(h.avgPrice)}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600 }}>{fmt(h.ltp)}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13 }}>{fmt(invested)}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13 }}>{fmt(current)}</td>
                            <td style={{ padding: '11px 12px', fontWeight: 700, color: pnl >= 0 ? '#16a34a' : '#dc2626' }}>{pnl >= 0 ? '+' : ''}{fmt(pnl)}</td>
                            <td style={{ padding: '11px 12px', fontWeight: 700, color: pnl >= 0 ? '#16a34a' : '#dc2626' }}>{pnl >= 0 ? '+' : ''}{pnlPct}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'Orders' && (
            <div>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading orders...</div> : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No orders placed yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {orders.map((o, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{o.symbol}</span>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: o.side === 'BUY' ? '#f0fdf4' : '#fef2f2', color: o.side === 'BUY' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{o.side}</span>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>{o.type}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>Qty: {o.qty} · Price: {fmt(o.price)} · {new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, background: o.status === 'EXECUTED' ? '#f0fdf4' : o.status === 'PENDING' ? '#fefce8' : '#fef2f2', color: o.status === 'EXECUTED' ? '#16a34a' : o.status === 'PENDING' ? '#ca8a04' : '#dc2626' }}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Place Order' && <PlaceOrderForm token={token} onSuccess={() => { fetchData(); setTab('My Portfolio') }} />}
        </div>
      </div>
    </div>
  )
}

function PlaceOrderForm({ token, onSuccess }) {
  const [form, setForm] = useState({ symbol: '', exchange: 'NYSE', side: 'BUY', type: 'MARKET', qty: '', price: '', stopLoss: '' })
  const [loading, setLoading] = useState(false)
  const inp = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none' }

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/trading/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(form.side + ' order placed for ' + form.symbol)
      setForm({ symbol: '', exchange: 'NYSE', side: 'BUY', type: 'MARKET', qty: '', price: '', stopLoss: '' })
      if (onSuccess) onSuccess()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Place Order</h3>
      <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Stock Symbol</label>
            <input required placeholder="e.g. AAPL, MSFT, TSLA, NVDA" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })} style={inp} />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Enter stock ticker (e.g. AAPL = Apple, MSFT = Microsoft, TSLA = Tesla)</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Exchange</label>
            <select value={form.exchange} onChange={e => setForm({ ...form, exchange: e.target.value })} style={inp}>
              <option>NYSE</option>
              <option>NASDAQ</option>
              <option>LSE</option>
              <option>Euronext</option>
              <option>TSX</option>
              <option>ASX</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Direction</label>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #d1d5db' }}>
            {['BUY', 'SELL'].map(s => (
              <button key={s} type="button" onClick={() => setForm({ ...form, side: s })} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 700, background: form.side === s ? (s === 'BUY' ? '#16a34a' : '#dc2626') : 'white', color: form.side === s ? 'white' : '#6b7280' }}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Order Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['MARKET', 'LIMIT', 'STOP_LOSS'].map(t => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} style={{ flex: 1, padding: '9px', borderRadius: 6, border: '1px solid ' + (form.type === t ? '#1e3a8a' : '#d1d5db'), background: form.type === t ? '#eff6ff' : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: form.type === t ? '#1e3a8a' : '#6b7280', fontFamily: 'Urbanist,sans-serif' }}>
                {t === 'STOP_LOSS' ? 'Stop Loss' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: form.type === 'MARKET' ? '1fr' : '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Quantity (shares)</label>
            <input type="number" required min="1" placeholder="e.g. 10" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} style={inp} />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Min: 1 share · Enter whole number of shares</div>
          </div>
          {form.type !== 'MARKET' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Limit Price (USD)</label>
              <input type="number" required min="0.01" step="0.01" placeholder="e.g. 185.50" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inp} />
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Price per share in USD (e.g. 185.50)</div>
            </div>
          )}
        </div>

        {form.type === 'STOP_LOSS' && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Stop Price (USD)</label>
            <input type="number" min="0.01" step="0.01" placeholder="e.g. 175.00" value={form.stopLoss} onChange={e => setForm({ ...form, stopLoss: e.target.value })} style={inp} />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Trigger price — order executes when stock hits this price</div>
          </div>
        )}

        <div style={{ padding: 12, background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a', fontSize: 12, color: '#92400e', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          Margin and account balance are validated before order routing. Investments are subject to market risk. Past performance is not indicative of future results.
        </div>

        <button type="submit" disabled={loading} style={{ padding: '12px', background: form.side === 'BUY' ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Placing order...' : form.side + ' ' + (form.symbol || 'Stock')}
        </button>
      </form>
    </div>
  )
}