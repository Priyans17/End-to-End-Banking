import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Star, CreditCard, TrendingUp, Shield, Home, Smartphone, Headphones, Laptop, Shirt, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'financial', 'electronics', 'fashion', 'home']
const CAT_LABELS = { All: 'All Products', financial: 'Financial Products', electronics: 'Electronics', fashion: 'Fashion', home: 'Home & Living' }
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const PRODUCT_ICONS = {
  financial: CreditCard,
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
}

const PRODUCT_COLORS = {
  financial: { bg: '#eff6ff', icon: '#1e3a8a' },
  electronics: { bg: '#f0fdf4', icon: '#16a34a' },
  fashion: { bg: '#fdf4ff', icon: '#9333ea' },
  home: { bg: '#fff7ed', icon: '#ea580c' },
}

function ProductIcon({ category, name }) {
  const colors = PRODUCT_COLORS[category] || { bg: '#f9fafb', icon: '#6b7280' }
  const Icon = PRODUCT_ICONS[category] || Zap
  return (
    <div style={{ height: 140, background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 56, height: 56, background: colors.icon + '18', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} color={colors.icon} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.icon, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', padding: '0 12px' }}>{category}</div>
    </div>
  )
}

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [cartCount, setCartCount] = useState(0)
  const token = localStorage.getItem('aura_token')

  useEffect(() => { fetchProducts(); fetchCartCount() }, [category, sort])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, limit: 20 })
      if (category !== 'All') params.append('category', category)
      if (search) params.append('search', search)
      const res = await fetch('/api/shop/products?' + params)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {} finally { setLoading(false) }
  }

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart', { headers: { Authorization: 'Bearer ' + token } })
      const data = await res.json()
      setCartCount(data.cart?.items?.length || 0)
    } catch (err) {}
  }

  const addToCart = async (productId) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ productId, quantity: 1 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Added to cart')
      setCartCount(data.cart?.items?.length || 0)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Marketplace</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Financial products, services, and more — pay with your Aura account</p>
        </div>
        <Link to="/dashboard/cart" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#1e3a8a', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 13, position: 'relative' }}>
          <ShoppingCart size={16} /> Cart
          {cartCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#ef4444', borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchProducts()}
            placeholder="Search products..." style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '9px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none', background: 'white' }}>
          <option value="newest">Neweste</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid ' + (category === c ? '#1e3a8a' : '#e5e7eb'), background: category === c ? '#1e3a8a' : 'white', color: category === c ? 'white' : '#6b7280', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Urbanist,sans-serif' }}>
            {CAT_LABELS[c] || c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No products found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map(product => (
            <div key={product._id} style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <ProductIcon category={product.category} name={product.name} />
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
                {product.discount > 0 && (
                  <span style={{ display: 'inline-block', background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, marginBottom: 6, alignSelf: 'flex-start' }}>{product.discount}% off</span>
                )}
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{product.brand}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.4, minHeight: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{product.rating?.toFixed(1)}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>({product.numReviews})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 'auto', paddingTop: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{fmt(product.price)}</span>
                  {product.originalPrice > product.price && <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>}
                </div>
                <button onClick={() => addToCart(product._id)} style={{ width: '100%', padding: '9px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Urbanist,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <ShoppingCart size={12} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}