import { Navigate } from 'react-router-dom'

function ProtectedRoute({ allowedRoles, children }) {
  const accessToken = sessionStorage.getItem('accessToken')
  const user = JSON.parse(sessionStorage.getItem('user'))

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }

    if (user.role === 'STAFF') {
      return <Navigate to="/staff" replace />
    }

    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute