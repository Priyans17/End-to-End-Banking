import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], discount: 0 })
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState('')
  const [applying, setApplying] = useState(false)
  const token = localStorage.getItem('aura_token')
  const navigate = useNavigate()

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setCart(data.cart || { items: [], discount: 0 })
    } catch (err) { } finally { setLoading(false) }
  }

  const updateQty = async (productId, quantity) => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity })
      })
      const data = await res.json()
      setCart(data.cart || { items: [], discount: 0 })
    } catch (err) { toast.error('Failed to update cart') }
  }

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setCart(data.cart || { items: [], discount: 0 })
      toast.success('Item removed')
    } catch (err) { toast.error('Failed to remove item') }
  }

  const applyCoupon = async () => {
    setApplying(true)
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: coupon })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.message)
      fetchCart()
    } catch (err) { toast.error(err.message) }
    finally { setApplying(false) }
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)
  const subtotal = cart.items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax - (cart.discount || 0)

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading cart...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Shopping Cart</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>{cart.items.length} item(s) in your cart</p>
      </div>

      {cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9' }}>
          <ShoppingBag size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>Add products from the shop to get started</p>
          <Link to="/dashboard/shop" style={{ padding: '12px 28px', background: '#1e3a8a', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Browse Shop</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
            {cart.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: 20, borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 10, background: '#eff6ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={28} color="#1e3a8a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{item.product?.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>{fmt(item.price)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.product?._id, item.quantity - 1)} style={{ padding: '6px 12px', border: 'none', background: 'white', cursor: 'pointer', color: '#374151', fontSize: 16 }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '6px 16px', fontWeight: 700, fontSize: 14, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product?._id, item.quantity + 1)} style={{ padding: '6px 12px', border: 'none', background: 'white', cursor: 'pointer', color: '#374151', fontSize: 16 }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>{fmt(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product?._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 8 }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Order Summary</h3>

            {/* Coupon */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Tag size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="e.g. SAVE15, WELCOME, AURA10"
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
              
              </div>
              <button onClick={applyCoupon} disabled={applying || !coupon} style={{ padding: '9px 14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist,sans-serif' }}>
                {applying ? '...' : 'Apply'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>Any coupon code gives 15% off</div>

            {[
              { label: 'Subtotal', value: fmt(subtotal) },
              { label: 'Shipping', value: shipping === 0 ? 'FREE' : fmt(shipping) },
              { label: 'Tax (8%)', value: fmt(tax) },
              ...(cart.discount > 0 ? [{ label: `Coupon (${cart.coupon})`, value: `-${fmt(cart.discount)}`, color: '#16a34a' }] : []),
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: r.color || '#0f172a' }}>{r.value}</span>
              </div>
            ))}

            <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a' }}>{fmt(total)}</span>
            </div>

            <button onClick={() => navigate('/dashboard/checkout')} style={{
              width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1e3a8a,#6366f1)',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', marginBottom: 12
            }}>
              Proceed to Checkout
            </button>
            <Link to="/dashboard/shop" style={{ display: 'block', textAlign: 'center', fontSize: 14, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}