import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#1e3a8a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color="white" />
          </div>
          <span style={{ fontFamily: 'Urbanist,sans-serif', fontWeight: 800, fontSize: 18, color: '#111827' }}>Aura</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Features</a>
          <a href="#testimonials" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Testimonials</a>
          <a href="#faq" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>FAQ</a>
        </nav>

        {/* Desktop auth buttons */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ padding: '7px 16px', borderRadius: 6, background: '#1e3a8a', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Dashboard</Link>
              <button onClick={handleLogout} style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: 600, fontSize: 13, padding: '7px 14px' }}>Sign In</Link>
              <Link to="/register" style={{ padding: '7px 16px', borderRadius: 6, background: '#1e3a8a', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', padding: 4 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '12px 24px 20px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: 15, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>Features</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)} style={{ color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: 15, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>Testimonials</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} style={{ color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: 15, padding: '10px 0' }}>FAQ</a>
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: '10px 16px', borderRadius: 6, background: '#1e3a8a', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Dashboard</Link>
                <button onClick={() => { setMobileOpen(false); handleLogout() }} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} style={{ padding: '10px 16px', borderRadius: 6, background: '#1e3a8a', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
