import { useState, useEffect } from 'react'
import { Package, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  placed: { bg: '#eff6ff', color: '#1e3a8a' },
  confirmed: { bg: '#f0fdf4', color: '#16a34a' },
  processing: { bg: '#fef3c7', color: '#92400e' },
  shipped: { bg: '#f5f3ff', color: '#7c3aed' },
  delivered: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('aura_token')

  useEffect(() => {
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setOrders(d.orders || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cancelOrder = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
      const text = await res.text()
      let data = {}
      try { data = JSON.parse(text) } catch(e) { if (!res.ok) throw new Error(text || 'Request failed') }
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order')
      toast.success('Order cancelled successfully')
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o))
    } catch (err) { toast.error(err.message) }
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>My Orders</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Track and manage your purchases</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9' }}>
          <Package size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>Start shopping to see your orders here</p>
          <Link to="/dashboard/shop" style={{ padding: '12px 28px', background: '#1e3a8a', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Browse Shop</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.placed
            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Order #{order.orderNumber}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>{order.status}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{fmt(order.totalAmount)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#f8fafc', borderRadius: 8 }}>
                      {false && item.image && <img src={item.image} alt={item.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }} />}
                      <span style={{ fontSize: 13, color: '#374151' }}>{item.name} x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                {['placed', 'confirmed', 'processing'].includes(order.status) && (
                  <button onClick={() => cancelOrder(order._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'white', border: '1.5px solid #fee2e2', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#dc2626', fontFamily: 'Urbanist,sans-serif' }}>
                    <RotateCcw size={13} /> Cancel Order
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}