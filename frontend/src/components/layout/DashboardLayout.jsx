import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Landmark, TrendingUp, PieChart, Shield, ShoppingBag, ShoppingCart, Package, LogOut, Menu, X, Bell, ChevronDown, User, TrendingDown, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/banking', icon: Landmark, label: 'Banking' },
  { to: '/dashboard/trading', icon: TrendingUp, label: 'Investments' },
  { to: '/dashboard/mutual-funds', icon: PieChart, label: 'Funds' },
  { to: '/dashboard/insurance', icon: Shield, label: 'Insurance' },
  { to: '/dashboard/shop', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/dashboard/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/dashboard/orders', icon: Package, label: 'Orders' }
]

const typeIcon = (type) => {
  const props = { size: 14 }
  switch (type) {
    case 'transaction': return <TrendingDown {...props} color="#6366f1" />
    case 'order': return <Package {...props} color="#f59e0b" />
    case 'insurance': return <Shield {...props} color="#10b981" />
    case 'investment': return <TrendingUp {...props} color="#1e3a8a" />
    case 'security': return <AlertTriangle {...props} color="#dc2626" />
    default: return <Info {...props} color="#6b7280" />
  }
}

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const notifRef = useRef(null)
  const token = localStorage.getItem('aura_token')

  const fetchNotifications = () => {
    if (!token) return
    fetch('/api/notifications', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || [])
        setUnreadCount(d.unreadCount || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH', headers: { Authorization: 'Bearer ' + token } })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markRead = async (id) => {
    await fetch('/api/notifications/' + id + '/read', { method: 'PATCH', headers: { Authorization: 'Bearer ' + token } })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const deleteNotif = async (e, id) => {
    e.stopPropagation()
    await fetch('/api/notifications/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
    setNotifications(prev => prev.filter(n => n._id !== id))
    setUnreadCount(prev => {
      const wasUnread = notifications.find(n => n._id === id && !n.read)
      return wasUnread ? Math.max(0, prev - 1) : prev
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 220 : 56, minHeight: '100vh', background: '#111827', transition: 'width 0.2s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', minHeight: 56 }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: '#1e3a8a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={14} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'white', fontFamily: 'Urbanist,sans-serif', whiteSpace: 'nowrap' }}>Aura</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 6, textDecoration: 'none', transition: 'background 0.15s',
              background: isActive ? '#1e3a8a' : 'transparent',
              color: isActive ? 'white' : '#9ca3af',
              fontWeight: isActive ? 600 : 400, fontSize: 13,
            })}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '10px 6px', borderTop: '1px solid #1f2937' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', width: '100%', fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 400 }}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ height: 56, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px', gap: 12, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>

          {/* Notifications Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', position: 'relative', display: 'flex', alignItems: 'center', padding: 4 }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, background: '#dc2626', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Urbanist,sans-serif' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 360, zIndex: 200, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: 'Urbanist,sans-serif' }}>Notifications</span>
                    {unreadCount > 0 && <span style={{ marginLeft: 8, fontSize: 11, background: '#eff6ff', color: '#1e3a8a', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: 12, color: '#1e3a8a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontWeight: 600 }}>
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      <Bell size={28} color="#e2e8f0" style={{ marginBottom: 8 }} />
                      <div>No notifications yet</div>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n._id} onClick={() => markRead(n._id)} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: n.read ? 'white' : '#f0f7ff', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'white' : '#f0f7ff'}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        {typeIcon(n.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#0f172a', fontFamily: 'Urbanist,sans-serif', lineHeight: 1.3 }}>{n.title}</div>
                          {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1e3a8a', flexShrink: 0, marginTop: 4 }} />}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                      </div>
                      <button onClick={(e) => deleteNotif(e, n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                        onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {notifications.length > 0 && (
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Urbanist,sans-serif' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''} total</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
              <div style={{ width: 28, height: 28, background: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="white" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name?.split(' ')[0] || 'Account'}</span>
              <ChevronDown size={14} color="#6b7280" />
            </button>

            {userMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180, zIndex: 100 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user?.email}</div>
                </div>
                <div style={{ padding: 6 }}>
                  <button onClick={() => { setUserMenuOpen(false); navigate('/dashboard') }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', textAlign: 'left', borderRadius: 4, fontFamily: 'Urbanist,sans-serif' }}>Dashboard</button>
                  <button onClick={() => { setUserMenuOpen(false); handleLogout() }} style={{ display: 'block', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', textAlign: 'left', borderRadius: 4, fontFamily: 'Urbanist,sans-serif' }}>Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}