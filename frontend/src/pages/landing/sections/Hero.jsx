
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section style={{ minHeight: '88vh', background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', left: '8%', width: 320, height: 320, background: 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 280, height: 280, background: 'radial-gradient(circle,rgba(30,58,138,0.07),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(30,58,138,0.08)', borderRadius: 100, border: '1px solid rgba(30,58,138,0.15)', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, background: '#1e3a8a', borderRadius: '50%' }}></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a8a' }}>Trusted by over 5 million customers worldwide</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,5.5vw,64px)', fontWeight: 800, lineHeight: 1.1, color: '#111827', letterSpacing: '-1.5px', marginBottom: 20 }}>
          Your Complete{' '}
          <span style={{ background: 'linear-gradient(135deg,#1e3a8a,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Financial Platform
          </span>
        </h1>

        <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
          Banking, investments, insurance, and marketplace — unified in one secure, internationally compliant platform built for modern finance.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#1e3a8a', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px rgba(30,58,138,0.25)' }}>
            Open an Account <ArrowRight size={16} />
          </Link>
          <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'white', color: '#374151', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 15, border: '1px solid #e5e7eb' }}>
            Learn More
          </a>
        </div>

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {[{ val: '$2.4T+', label: 'Assets Under Management' }, { val: '5M+', label: 'Active Customers' }, { val: '99.9%', label: 'Platform Uptime' }, { val: '180+', label: 'Countries Supported' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a8a' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
