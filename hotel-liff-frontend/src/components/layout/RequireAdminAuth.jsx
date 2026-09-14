import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

// Client-side gate is a UX convenience only (skip straight to the login
// screen instead of flashing a page that will just 401) - the backend's
// verifyAdminToken middleware is the actual enforcement.
export default function RequireAdminAuth() {
  const { token } = useAdminAuth()
  if (!token) return <Navigate to="/admin" replace />
  return <Outlet />
}
