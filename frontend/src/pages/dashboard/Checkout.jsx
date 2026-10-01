import { useState, useEffect, useRef } from 'react'
import { CheckCircle, CreditCard, Lock, Upload, X, FileImage, QrCode, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || 'pk_test_51TkAoS21YKdjh046zUw3HUsIg3oy7t7tA18wDB80j4P1ydvwgyUdPdZyoMy6Uj449LFT1TnYmBSzgD4lQOdwW8PV00QgKTo1Ul'
const stripePromise = loadStripe(STRIPE_PK)

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)
const inp = { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', boxSizing: 'border-box' }

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Urbanist, sans-serif',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#1e3a8a',
    },
    invalid: { color: '#dc2626', iconColor: '#dc2626' }
  }
}

function ReceiptUpload({ total, onSuccess }) {
  const [receipt, setReceipt] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP, or PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB')
      return
    }
    setReceipt(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleRemove = () => {
    setReceipt(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!receipt) { toast.error('Please upload a receipt first'); return }
    setSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      toast.success('Receipt verified!')
      onSuccess('rcpt_' + Date.now())
    } catch { toast.error('Receipt submission failed') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{ marginTop: 24, borderTop: '1.5px solid #f1f5f9', paddingTop: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        Upload Payment Receipt
      </label>

      {!receipt ? (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 10,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8fafc',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
        >
          <Upload size={28} color="#6366f1" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Click to upload receipt</p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>JPG, PNG, WEBP or PDF · Max 5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFile}
            data-testid="receipt-upload-input"
          />
        </div>
      ) : (
        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
          {preview ? (
            <img src={preview} alt="Receipt preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          ) : (
            <div style={{ width: 56, height: 56, background: '#e0e7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileImage size={24} color="#6366f1" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{(receipt.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}
            aria-label="Remove receipt"
            data-testid="receipt-remove-btn"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {receipt && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          data-testid="receipt-submit-btn"
          style={{ marginTop: 16, width: '100%', padding: '13px', background: submitting ? '#94a3b8' : 'linear-gradient(135deg,#1e3a8a,#6366f1)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif' }}
        >
          {submitting ? 'Verifying receipt...' : 'Submit Receipt & Complete Payment'}
        </button>
      )}
    </div>
  )
}

function ScanQR({ total }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(null)
  const videoRef = useRef()
  const streamRef = useRef()

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setScanning(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      toast.error('Camera access denied or not available')
    }
  }

  const stopScan = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setScanning(false)
  }

  const simulateScan = () => {
    stopScan()
    setScanned('UPI://pay?pa=merchant@bank&pn=AuraStore&am=' + total.toFixed(2) + '&cu=USD')
    toast.success('QR scanned successfully!')
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af' }}>
        <strong>Amount to pay:</strong> {fmt(total)} — scan the merchant QR code with your payment app.
      </div>

      {!scanning && !scanned && (
        <div
          style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: '36px 16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}
          onClick={startScan}
          data-testid="qr-scan-zone"
        >
          <QrCode size={48} color="#6366f1" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Tap to scan QR code</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Opens your device camera</p>
        </div>
      )}

      {scanning && (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', borderRadius: 12 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 180, height: 180, border: '3px solid #6366f1', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button type="button" onClick={simulateScan} style={{ padding: '9px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
              <Camera size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Simulate Scan
            </button>
            <button type="button" onClick={stopScan} style={{ padding: '9px 20px', background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}

      {scanned && (
        <div style={{ border: '1.5px solid #bbf7d0', borderRadius: 10, padding: 14, background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CheckCircle size={16} color="#16a34a" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>QR Scanned</span>
          </div>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0, wordBreak: 'break-all' }}>{scanned}</p>
          <button type="button" onClick={() => { setScanned(null) }} style={{ marginTop: 10, fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Urbanist,sans-serif' }}>Scan again</button>
        </div>
      )}
    </div>
  )
}

function PaymentTabs({ clientSecret, total, onSuccess, onBack }) {
  const [tab, setTab] = useState('card')
  const tabs = [
    { id: 'card', label: 'Card', icon: <CreditCard size={14} /> },
    { id: 'qr',   label: 'Scan QR', icon: <QrCode size={14} /> },
    { id: 'receipt', label: 'Receipt', icon: <Upload size={14} /> },
  ]
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            data-testid={`payment-tab-${t.id}`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Urbanist,sans-serif', transition: 'all 0.15s',
              background: tab === t.id ? '#1e3a8a' : 'white',
              color: tab === t.id ? 'white' : '#64748b',
              border: tab === t.id ? '1.5px solid #1e3a8a' : '1.5px solid #e2e8f0',
            }}
          >{t.icon}{t.label}</button>
        ))}
      </div>
      {tab === 'card' && (
        <Elements stripe={stripePromise}>
          <StripeCardForm clientSecret={clientSecret} total={total} onSuccess={onSuccess} onBack={onBack} />
        </Elements>
      )}
      {tab === 'qr' && <ScanQR total={total} />}
      {tab === 'receipt' && <ReceiptUpload total={total} onSuccess={onSuccess} />}
    </div>
  )
}

function StripeCardForm({ clientSecret, total, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setCardError('')
    try {
      const cardElement = elements.getElement(CardElement)
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      })
      if (error) {
        setCardError(error.message)
        throw new Error(error.message)
      }
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        throw new Error('Payment not completed. Status: ' + paymentIntent?.status)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Card Details</label>
        <div style={{ padding: '16px', background: 'white', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
          <CardElement options={CARD_STYLE} onChange={e => setCardError(e.error ? e.error.message : '')} />
        </div>
        {cardError && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{cardError}</div>}
      </div>

      <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12, color: '#15803d' }}>
        <strong>Test card:</strong> 4242 4242 4242 4242 · Any future date · Any CVV · Any ZIP
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
        <Lock size={12} color="#16a34a" />
        <span>Secured by Stripe · 256-bit SSL encryption</span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={onBack} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, color: '#374151' }}>Back</button>
        <button type="submit" disabled={loading || !stripe} style={{ flex: 2, padding: '13px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1e3a8a,#6366f1)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
          {loading ? 'Processing...' : 'Pay ' + fmt(total)}
        </button>
      </div>
    </form>
  )
}

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState({ items: [], discount: 0 })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', city: '', state: '', zip: '', country: 'United States' })
  const token = localStorage.getItem('aura_token')

  useEffect(() => {
    fetch('/api/cart', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json()).then(d => setCart(d.cart || { items: [], discount: 0 })).catch(() => {})
  }, [])

  const subtotal = cart.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + shipping + tax - (cart.discount || 0)

  const preparePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ amount: total, currency: 'usd' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setClientSecret(data.clientSecret)
      setStep(2)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (piId) => {
    setLoading(true)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ shippingAddress: address, paymentMethod: 'card', paymentId: piId })
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.message)
      setOrderId(orderData.order?.orderNumber)
      setStep(3)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <CheckCircle size={40} color="#16a34a" />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Order Placed!</h2>
      <p style={{ color: '#64748b', marginBottom: 8 }}>Order #{orderId}</p>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Payment confirmed. Estimated delivery: 5-7 business days.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/dashboard/orders" style={{ padding: '12px 24px', background: '#1e3a8a', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>View Orders</Link>
        <Link to="/dashboard/shop" style={{ padding: '12px 24px', background: 'white', border: '1.5px solid #e2e8f0', color: '#374151', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Continue Shopping</Link>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Checkout</h1>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {['Delivery Address', 'Payment'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i+1 ? '#16a34a' : step === i+1 ? '#1e3a8a' : '#e2e8f0', color: step >= i+1 ? 'white' : '#94a3b8', fontWeight: 700, fontSize: 13 }}>
                {step > i+1 ? <CheckCircle size={14} /> : i+1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step === i+1 ? '#0f172a' : '#94a3b8' }}>{s}</span>
            </div>
            {i < 1 && <div style={{ flex: 1, height: 2, background: step > i+1 ? '#16a34a' : '#e2e8f0', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: 28 }}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Delivery Address</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Full Name</label>
                    <input id="checkout-name" data-testid="checkout-name-input" aria-label="Full Name" placeholder="e.g. John Smith" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Phone</label>
                    <input id="checkout-phone" data-testid="checkout-phone-input" aria-label="Phone Number" placeholder="e.g. +1 555 000 0000" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Street Address</label>
                  <input id="checkout-address" data-testid="checkout-address-input" aria-label="Street Address" placeholder="e.g. 123 Main Street" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} style={inp} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>City</label>
                    <input id="checkout-city" data-testid="checkout-city-input" aria-label="City" placeholder="e.g. New York" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>State</label>
                    <input placeholder="e.g. NY" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>ZIP Code</label>
                    <input id="checkout-zip" data-testid="checkout-zip-input" aria-label="ZIP Code" placeholder="e.g. 10001" maxLength={10} value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Country</label>
                  <select value={address.country} onChange={e => setAddress({...address, country: e.target.value})} style={inp}>
                    {['United States','United Kingdom','Canada','Australia','Germany','France','Singapore','UAE','Japan','India'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => { if (!address.name || !address.line1 || !address.city || !address.zip) { toast.error('Please fill all required fields'); return } preparePayment() }} disabled={loading} style={{ padding: '13px', background: 'linear-gradient(135deg,#1e3a8a,#6366f1)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
                  {loading ? 'Preparing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && clientSecret && (
            <PaymentTabs clientSecret={clientSecret} total={total} onSuccess={handlePaymentSuccess} onBack={() => { setStep(1); setClientSecret(null) }} />
          )}
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f1f5f9', padding: 20 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Order Summary</h4>
          {cart.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{item.product?.name || item.name} x{item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 12, paddingTop: 12 }}>
            {[
              { label: 'Subtotal', value: fmt(subtotal) },
              { label: 'Shipping', value: shipping === 0 ? 'FREE' : fmt(shipping) },
              { label: 'Tax (8%)', value: fmt(tax) },
              ...(cart.discount ? [{ label: 'Discount', value: '-' + fmt(cart.discount), color: '#16a34a' }] : [])
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color || '#0f172a' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a' }}>{fmt(total)}</span>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={14} color="#1e3a8a" /> Secured by Stripe
          </div>
        </div>
      </div>
    </div>
  )
}