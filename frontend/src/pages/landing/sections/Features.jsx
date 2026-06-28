
import { Landmark, TrendingUp, PieChart, Shield, Lock, Zap, Eye, RefreshCw } from 'lucide-react'

const features = [
  { icon: Landmark, title: 'Core Banking', desc: 'Real-time account management, domestic and international transfers, and comprehensive transaction history.', color: '#1e3a8a' },
  { icon: TrendingUp, title: 'Equity Trading', desc: 'Live market data, multiple order types, and real-time portfolio tracking across global exchanges.', color: '#6366f1' },
  { icon: PieChart, title: 'Investment Funds', desc: 'Diversified fund options with historical performance data and automated investment plans.', color: '#10b981' },
  { icon: Shield, title: 'Insurance', desc: 'Compare and manage health, life, motor, and property insurance policies from leading providers.', color: '#f59e0b' },
  { icon: Lock, title: 'Bank-Grade Security', desc: 'AES-256 encryption, multi-factor authentication, and continuous fraud monitoring.', color: '#ef4444' },
  { icon: Zap, title: 'Instant Payments', desc: 'Send and receive money instantly via multiple payment rails including SWIFT, SEPA, and local networks.', color: '#8b5cf6' },
  { icon: Eye, title: 'Full Transparency', desc: 'Clear fee structures, consent management, and complete data portability in line with global regulations.', color: '#0ea5e9' },
  { icon: RefreshCw, title: 'Automated Mandates', desc: 'Set up recurring payments and investment plans with full control and easy cancellation.', color: '#14b8a6' },
]

export default function Features() {
  return (
    <section id="features" style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>
            Everything you need to manage your finances
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
            A complete suite of financial tools designed for individuals and businesses worldwide.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ padding: 24, borderRadius: 10, border: '1px solid #f3f4f6', background: '#fafafa', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ width: 40, height: 40, background: color + '15', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
