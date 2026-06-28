import { useState, useRef, useEffect } from 'react'
import { Upload, AlertTriangle, Globe, Layers, MousePointer, Type, Move, ChevronDown, Bell, ExternalLink, CheckSquare, ToggleLeft, ToggleRight, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'

const SECTIONS = ['Forms & Inputs', 'File & Media', 'Alerts & Dialogs', 'Drag & Drop', 'Rich Text', 'iFrame & Embed', 'Multi-Window', 'Scroll & Keys']

export default function TestLab() {
  const [section, setSection] = useState('Forms & Inputs')

  const tabStyle = (s) => ({
    padding: '10px 16px', border: 'none', background: 'transparent',
    fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: section === s ? '#1e3a8a' : '#6b7280',
    borderBottom: section === s ? '2px solid #1e3a8a' : '2px solid transparent',
    whiteSpace: 'nowrap'
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Interactive Test Lab</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Comprehensive UI interactions — forms, uploads, alerts, drag-drop, rich text, and more</p>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {SECTIONS.map(s => <button key={s} onClick={() => setSection(s)} style={tabStyle(s)}>{s}</button>)}
        </div>
        <div style={{ padding: 24 }}>
          {section === 'Forms & Inputs' && <FormsSection />}
          {section === 'File & Media' && <FileSection />}
          {section === 'Alerts & Dialogs' && <AlertsSection />}
          {section === 'Drag & Drop' && <DragDropSection />}
          {section === 'Rich Text' && <RichTextSection />}
          {section === 'iFrame & Embed' && <IframeSection />}
          {section === 'Multi-Window' && <MultiWindowSection />}
          {section === 'Scroll & Keys' && <ScrollKeysSection />}
        </div>
      </div>
    </div>
  )
}

function FormsSection() {
  const [form, setForm] = useState({ text: '', email: '', password: '', number: '', date: '', time: '', color: '#1e3a8a', range: 50, select: '', multi: [], radio: '', checkbox: false, textarea: '' })
  const [submitted, setSubmitted] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(form)
    toast.success('Form submitted successfully!')
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Form Inputs & Validation</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Text Input</label>
            <input type="text" placeholder="Enter any text" value={form.text} onChange={e => setForm({...form, text: e.target.value})} style={inp} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>e.g. Hello World</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
            <input type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inp} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Must be valid email format</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password</label>
            <input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8} style={inp} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Min 8 characters required</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Number</label>
            <input type="number" placeholder="1–100" min={1} max={100} value={form.number} onChange={e => setForm({...form, number: e.target.value})} style={inp} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Range: 1 to 100</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Time</label>
            <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={inp} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Color Picker</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: 48, height: 40, borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer', padding: 2 }} />
            <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{form.color}</span>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: form.color }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Range Slider: {form.range}</label>
          <input type="range" min={0} max={100} value={form.range} onChange={e => setForm({...form, range: e.target.value})} style={{ width: '100%', accentColor: '#1e3a8a' }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Drag to set value (0–100)</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Dropdown</label>
          <select value={form.select} onChange={e => setForm({...form, select: e.target.value})} style={inp}>
            <option value="">Select an option</option>
            <option value="option1">Option 1 — Basic</option>
            <option value="option2">Option 2 — Standard</option>
            <option value="option3">Option 3 — Premium</option>
            <option value="option4">Option 4 — Enterprise</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Radio Buttons</label>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Option A', 'Option B', 'Option C'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <input type="radio" name="radio" value={opt} checked={form.radio === opt} onChange={e => setForm({...form, radio: e.target.value})} style={{ accentColor: '#1e3a8a' }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Checkboxes</label>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['Feature A', 'Feature B', 'Feature C', 'Feature D'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                <input type="checkbox" style={{ accentColor: '#1e3a8a', width: 15, height: 15 }} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Textarea</label>
          <textarea placeholder="Enter multi-line text here..." value={form.textarea} onChange={e => setForm({...form, textarea: e.target.value})} rows={4} style={{ ...inp, resize: 'vertical' }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Resizable · {form.textarea.length} characters</div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>Submit Form</button>
          <button type="reset" onClick={() => setForm({ text: '', email: '', password: '', number: '', date: '', time: '', color: '#1e3a8a', range: 50, select: '', multi: [], radio: '', checkbox: false, textarea: '' })} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', color: '#374151' }}>Reset</button>
        </div>
      </form>

      {submitted && (
        <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Form Submitted Successfully</div>
          <pre style={{ fontSize: 11, color: '#374151', overflow: 'auto', maxHeight: 200 }}>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

function FileSection() {
  const [files, setFiles] = useState([])
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
    if (selected[0]?.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(selected[0])
    } else {
      setPreview(null)
    }
    toast.success(`${selected.length} file(s) selected`)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>File Upload & Media</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Single File Upload</label>
          <input type="file" ref={fileRef} onChange={handleFiles} style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" />
          <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1e3a8a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
            <Upload size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Images, PDF, Word, Excel — max 10MB</div>
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', flex: 1 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{(f.size / 1024).toFixed(1)} KB · {f.type || 'unknown'}</div>
                </div>
              ))}
            </div>
          )}
          {preview && <img src={preview} alt="Preview" style={{ marginTop: 12, maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #e5e7eb', objectFit: 'contain' }} />}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Multiple File Upload</label>
          <input type="file" multiple onChange={e => { const f = Array.from(e.target.files); toast.success(f.length + ' files selected') }} style={{ ...{ padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', width: '100%', boxSizing: 'border-box' } }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Hold Ctrl/Cmd to select multiple files</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Image Upload with Preview</label>
          <input type="file" accept="image/*" onChange={e => {
            const f = e.target.files[0]
            if (f) { const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f) }
          }} style={{ padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Upload any image to see preview above</div>
        </div>
      </div>
    </div>
  )
}

function AlertsSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmResult, setConfirmResult] = useState(null)

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Alerts, Dialogs & Notifications</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Browser Alert', action: () => { alert('This is a native browser alert!\nClick OK to dismiss.'); toast.success('Alert dismissed') }, color: '#f59e0b' },
          { label: 'Browser Confirm', action: () => { const r = confirm('Do you want to proceed?\nClick OK to confirm or Cancel to abort.'); setConfirmResult(r ? 'Confirmed' : 'Cancelled'); toast(r ? 'You clicked OK' : 'You clicked Cancel') }, color: '#6366f1' },
          { label: 'Browser Prompt', action: () => { const r = prompt('Enter your name:', 'John Smith'); if (r) toast.success('You entered: ' + r) }, color: '#1e3a8a' },
          { label: 'Toast Success', action: () => toast.success('Operation completed successfully!'), color: '#16a34a' },
          { label: 'Toast Error', action: () => toast.error('Something went wrong. Please try again.'), color: '#dc2626' },
          { label: 'Toast Loading', action: () => { const t = toast.loading('Processing...'); setTimeout(() => toast.dismiss(t), 2000) }, color: '#6b7280' },
          { label: 'Custom Modal', action: () => setModalOpen(true), color: '#0891b2' },
          { label: 'Print Dialog', action: () => window.print(), color: '#374151' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{ padding: '14px', background: btn.color, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Urbanist,sans-serif', textAlign: 'left' }}>
            {btn.label}
          </button>
        ))}
      </div>
      {confirmResult && <div style={{ marginTop: 12, padding: 12, background: '#f0f9ff', borderRadius: 8, fontSize: 13, color: '#0369a1' }}>Confirm result: <strong>{confirmResult}</strong></div>}

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Custom Modal Dialog</h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>This is a custom modal dialog. It supports keyboard navigation (Tab, Escape) and focus trapping for accessibility testing.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setModalOpen(false); toast.success('Modal confirmed') }} style={{ flex: 1, padding: '11px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 700 }}>Confirm</button>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '11px', background: 'white', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontSize: 14, fontWeight: 600, color: '#374151' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DragDropSection() {
  const [items, setItems] = useState(['Item Alpha', 'Item Beta', 'Item Gamma', 'Item Delta', 'Item Epsilon'])
  const [dragIdx, setDragIdx] = useState(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [dropped, setDropped] = useState([])

  const handleDragStart = (i) => setDragIdx(i)
  const handleDrop = (i) => {
    if (dragIdx === null) return
    const newItems = [...items]
    const [removed] = newItems.splice(dragIdx, 1)
    newItems.splice(i, 0, removed)
    setItems(newItems)
    setDragIdx(null)
    toast.success('Item reordered!')
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Drag & Drop</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Reorderable List (drag to reorder)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((item, i) => (
              <div key={item} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(i)}
                style={{ padding: '12px 14px', background: dragIdx === i ? '#eff6ff' : '#f9fafb', borderRadius: 8, border: '1px solid ' + (dragIdx === i ? '#1e3a8a' : '#e5e7eb'), cursor: 'grab', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#374151', userSelect: 'none' }}>
                <Move size={14} color="#9ca3af" /> {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Drop Zone</div>
          <div onDragOver={e => { e.preventDefault(); setDropZoneActive(true) }} onDragLeave={() => setDropZoneActive(false)}
            onDrop={e => { e.preventDefault(); setDropZoneActive(false); const text = e.dataTransfer.getData('text'); setDropped(p => [...p, text || 'Item dropped']); toast.success('Item dropped!') }}
            style={{ border: '2px dashed ' + (dropZoneActive ? '#1e3a8a' : '#d1d5db'), borderRadius: 10, padding: 24, minHeight: 160, background: dropZoneActive ? '#eff6ff' : '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
            <Layers size={24} color={dropZoneActive ? '#1e3a8a' : '#9ca3af'} />
            <div style={{ fontSize: 13, color: dropZoneActive ? '#1e3a8a' : '#9ca3af', fontWeight: 600 }}>{dropZoneActive ? 'Release to drop' : 'Drag items here'}</div>
            {dropped.map((d, i) => <div key={i} style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>{d}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function RichTextSection() {
  const editorRef = useRef()
  const [content, setContent] = useState('')

  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); editorRef.current?.focus() }

  const btnStyle = { padding: '6px 10px', border: '1px solid #d1d5db', background: 'white', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Urbanist,sans-serif', fontWeight: 600, color: '#374151' }

  return (
    <div style={{ maxWidth: 700 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Rich Text Editor</h3>
      <div style={{ border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: '#f9fafb', borderBottom: '1px solid #d1d5db', flexWrap: 'wrap' }}>
          {[['Bold', 'bold', 'B'], ['Italic', 'italic', 'I'], ['Underline', 'underline', 'U'], ['Strike', 'strikeThrough', 'S']].map(([label, cmd, char]) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd) }} style={{ ...btnStyle, fontWeight: cmd === 'bold' ? 800 : 600, fontStyle: cmd === 'italic' ? 'italic' : 'normal', textDecoration: cmd === 'underline' ? 'underline' : cmd === 'strikeThrough' ? 'line-through' : 'none' }}>{char}</button>
          ))}
          <div style={{ width: 1, background: '#d1d5db', margin: '0 4px' }} />
          {[['H1', 'formatBlock', 'h1'], ['H2', 'formatBlock', 'h2'], ['P', 'formatBlock', 'p']].map(([label, cmd, val]) => (
            <button key={label} onMouseDown={e => { e.preventDefault(); exec(cmd, val) }} style={btnStyle}>{label}</button>
          ))}
          <div style={{ width: 1, background: '#d1d5db', margin: '0 4px' }} />
          {[['• List', 'insertUnorderedList'], ['1. List', 'insertOrderedList']].map(([label, cmd]) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd) }} style={btnStyle}>{label}</button>
          ))}
          <div style={{ width: 1, background: '#d1d5db', margin: '0 4px' }} />
          <button onMouseDown={e => { e.preventDefault(); const url = prompt('Enter URL:', 'https://'); if (url) exec('createLink', url) }} style={btnStyle}>Link</button>
          <button onMouseDown={e => { e.preventDefault(); exec('removeFormat') }} style={btnStyle}>Clear</button>
        </div>
        <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={e => setContent(e.currentTarget.innerHTML)}
          style={{ minHeight: 180, padding: 16, fontSize: 14, fontFamily: 'Urbanist,sans-serif', outline: 'none', lineHeight: 1.6, color: '#111827' }}
          data-placeholder="Start typing here... Use the toolbar above to format text, add lists, links, and more.">
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Supports bold, italic, underline, headings, lists, and links</div>
      {content && (
        <div style={{ marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>HTML OUTPUT:</div>
          <pre style={{ fontSize: 11, color: '#374151', overflow: 'auto', maxHeight: 100, whiteSpace: 'pre-wrap' }}>{content}</pre>
        </div>
      )}
    </div>
  )
}

function IframeSection() {
  const [src, setSrc] = useState('https://example.com')
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ maxWidth: 700 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>iFrame & Embedded Content</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16}}>
        <input value={src} onChange={e => setSrc(e.target.value)} placeholder="https://example.com" style={{ flex: 1, padding: '9px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
        <button onClick={() => setLoaded(true)} style={{ padding: '9px 16px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Urbanist,sans-serif' }}>Load</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['https://example.com', 'https://www.w3schools.com/html/html_iframe.asp'].map(u => (
          <button key={u} onClick={() => { setSrc(u); setLoaded(true) }} style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'Urbanist,sans-serif', color: '#374151' }}>{u.replace('https://', '')}</button>
        ))}
      </div>
      {loaded && (
        <iframe src={src} title="Embedded content" style={{ width: '100%', height: 300, border: '1px solid #e5e7eb', borderRadius: 8 }} onLoad={() => {}} />
      )}
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Note: Some sites block embedding via X-Frame-Options. Use example.com for testing.</div>
    </div>
  )
}

function MultiWindowSection() {
  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Multi-Window & Navigation</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Open New Tab', action: () => window.open('https://example.com', '_blank'), desc: 'Opens example.com in a new browser tab' },
          { label: 'Open New Window', action: () => window.open('https://example.com', '_blank', 'width=800,height=600'), desc: 'Opens a popup window (800x600)' },
          { label: 'Open Aura in New Tab', action: () => window.open(window.location.origin, '_blank'), desc: 'Opens this app in a new tab' },
          { label: 'Navigate Back', action: () => window.history.back(), desc: 'Browser back navigation' },
          { label: 'Navigate Forward', action: () => window.history.forward(), desc: 'Browser forward navigation' },
          { label: 'Reload Page', action: () => window.location.reload(), desc: 'Hard reload current page' },
          { label: 'Copy URL to Clipboard', action: () => { navigator.clipboard.writeText(window.location.href); toast.success('URL copied!') }, desc: 'Copies current page URL' },
        ].map(btn => (
          <div key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{btn.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{btn.desc}</div>
            </div>
            <button onClick={btn.action} style={{ padding: '8px 16px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Urbanist,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={12} /> Run
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScrollKeysSection() {
  const [keys, setKeys] = useState([])
  const [hovered, setHovered] = useState(false)
  const scrollRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      setKeys(prev => [{ key: e.key, code: e.code, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ maxWidth: 700 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Scroll & Key Press</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Scrollable Container</div>
          <div ref={scrollRef} style={{ height: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            {Array.from({length: 20}, (_, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#374151' }}>
                Scroll item {i + 1} — Lorem ipsum dolor sit amet
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => scrollRef.current?.scrollTo({top: 0, behavior: 'smooth'})} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Urbanist,sans-serif', fontWeight: 600 }}>Scroll Top</button>
            <button onClick={() => scrollRef.current?.scrollTo({top: 9999, behavior: 'smooth'})} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'Urbanist,sans-serif', fontWeight: 600 }}>Scroll Bottom</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Key Press Logger</div>
          <div style={{ padding: 16, background: '#111827', borderRadius: 8, minHeight: 200, fontFamily: 'monospace' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Press any key to log it here...</div>
            {keys.map((k, i) => (
              <div key={i} style={{ fontSize: 12, color: i === 0 ? '#4ade80' : '#9ca3af', marginBottom: 4 }}>
                [{k.time}] key="{k.key}" code="{k.code}"
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Click anywhere on the page then press keys</div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Hover & Double-Click</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ flex: 1, padding: 20, background: hovered ? '#1e3a8a' : '#f9fafb', color: hovered ? 'white' : '#374151', borderRadius: 8, border: '1px solid ' + (hovered ? '#1e3a8a' : '#e5e7eb'), textAlign: 'center', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', cursor: 'default' }}>
            {hovered ? 'Hovering!' : 'Hover over me'}
          </div>
          <div onDoubleClick={() => toast.success('Double-click detected!')}
            style={{ flex: 1, padding: 20, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Double-click me
          </div>
          <div onContextMenu={e => { e.preventDefault(); toast('Right-click detected!') }}
            style={{ flex: 1, padding: 20, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'context-menu' }}>
            Right-click me
          </div>
        </div>
      </div>
    </div>
  )
}
