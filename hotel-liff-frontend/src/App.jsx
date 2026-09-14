import AppRoutes from './router.jsx'
import { UserProvider } from './context/UserContext.jsx'
import LiffGuard from './liff/LiffGuard.jsx'

export default function App() {
  return (
    <UserProvider>
      <LiffGuard>
        <AppRoutes />
      </LiffGuard>
    </UserProvider>
  )
}
