export default function StatCard({ title, value, subtitle, icon: Icon, color = '#1e3a8a', trend }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 24,
      border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        {Icon && (
          <div style={{ width: 40, height: 40, background: `${color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {trend && (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: trend > 0 ? '#dcfce7' : '#fee2e2',
              color: trend > 0 ? '#16a34a' : '#dc2626'
            }}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {subtitle && <span style={{ fontSize: 13, color: '#94a3b8' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  )
}