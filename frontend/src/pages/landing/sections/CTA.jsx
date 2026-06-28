
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section style={{ padding: '80px 24px', background: '#111827', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 14 }}>
          Start your financial journey today
        </h2>
        <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 32, lineHeight: 1.6 }}>
          Join millions of customers who trust Aura for their banking, investments, and more.
        </p>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'white', color: '#111827', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          Open a Free Account <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
