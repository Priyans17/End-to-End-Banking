
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#111827', color: '#9ca3af', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, background: '#1e3a8a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={14} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: 'white', fontFamily: 'Urbanist,sans-serif' }}>Aura</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>A unified financial platform for banking, investments, insurance, and marketplace services.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Banking', '/dashboard/banking'], ['Investments', '/dashboard/trading'], ['Insurance', '/dashboard/insurance'], ['Marketplace', '/dashboard/shop']].map(([l, h]) => (
                <Link key={l} to={h} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'].map(l => (
                <a key={l} href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Help Center', 'Contact Us', 'Security', 'Status'].map(l => (
                <a key={l} href="#" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12 }}>© 2026 Aura Financial Technologies. All rights reserved.</span>
          <span style={{ fontSize: 12 }}>GDPR Compliant · ISO 27001 Certified · PCI DSS Level 1</span>
        </div>
      </div>
    </footer>
  )
}
