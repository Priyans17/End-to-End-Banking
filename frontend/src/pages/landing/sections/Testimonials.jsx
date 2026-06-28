
const testimonials = [
  { name: 'Sarah Mitchell', role: 'Portfolio Manager, London', text: "Aura's unified platform has transformed how I manage client portfolios. The real-time data and seamless transfers are exceptional.", avatar: 'SM' },
  { name: 'Marcus Weber', role: 'Business Owner, Frankfurt', text: 'Managing international payments used to be a headache and combursome. With Aura, everything is in one place and the fees are transparent.', avatar: 'MW' },
  { name: 'Priya Nair', role: 'Financial Analyst, Singapore', text: 'The investment fund dashboard gives me exactly the performance data I need also helps me save time. Clean interface, reliable execution.', avatar: 'PN' },
]

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: '80px 24px', background: '#f9fafb' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>Trusted by professionals worldwide</h2>
          <p style={{ fontSize: 16, color: '#6b7280' }}>What our customers say about Aura</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: 'white', borderRadius: 10, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, background: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
