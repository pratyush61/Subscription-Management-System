import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, staffOnly, adminOnly, customerOnly }) {
  const { user, isStaff, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  if (staffOnly && !isStaff) return <Navigate to="/portal" replace />
  if (customerOnly && user.role !== 'CUSTOMER') return <Navigate to="/" replace />
  return children
}
