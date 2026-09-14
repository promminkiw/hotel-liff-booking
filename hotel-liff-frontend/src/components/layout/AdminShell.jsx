import { Outlet } from 'react-router-dom'
import { AdminAuthProvider } from '../../context/AdminAuthContext.jsx'

export default function AdminShell() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  )
}
