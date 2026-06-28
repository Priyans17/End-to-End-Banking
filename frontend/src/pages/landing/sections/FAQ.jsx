
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'Is Aura available internationally?', a: 'Yes. Aura supports customers in over 180 countries with multi-currency accounts, international transfers via SWIFT and SEPA, and local payment rails.' },
  { q: 'How is my data protected?', a: 'All personal data is encrypted using AES-256. Data in transit is secured via TLS 1.3. We comply with GDPR, CCPA, and applicable local data protection regulations.' },
  { q: 'What payment methods are supported?', a: 'We support card payments (Visa, Mastercard, Amex), bank transfers, UPI, Apple Pay, Google Pay, and cash on delivery for marketplace orders.' },
  { q: 'Can I trade on international exchanges?', a: 'Yes. Aura supports trading on major global exchanges with Market, Limit, and Stop-Loss order types and real-time portfolio tracking.' },
  { q: 'Is there a free account option?', a: 'Yes. You can open a free account with no monthly fees. Premium plans unlock higher transaction limits, dedicated support, and advanced analytics.' },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section id="faq" style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: 12 }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 16, color: '#6b7280' }}>Everything you need to know about Aura</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: open === i ? '#f9fafb' : 'white', border: 'none', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, color: '#111827', textAlign: 'left' }}>
                {faq.q}
                <ChevronDown size={16} color="#6b7280" style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {open === i && <div style={{ padding: '0 18px 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
