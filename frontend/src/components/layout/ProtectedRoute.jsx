import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div style={{width:48,height:48,border:'4px solid #e2e8f0',borderTop:'4px solid #1e3a8a',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}
