export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: { background: '#f1f5f9', color: '#64748b' },
    success: { background: '#dcfce7', color: '#16a34a' },
    danger: { background: '#fee2e2', color: '#dc2626' },
    warning: { background: '#fef3c7', color: '#92400e' },
    info: { background: '#eff6ff', color: '#1e3a8a' },
    purple: { background: '#f5f3ff', color: '#7c3aed' },
  }
  const style = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 100,
      fontSize: 12, fontWeight: 700,
      background: style.background, color: style.color
    }}>
      {children}
    </span>
  )
}