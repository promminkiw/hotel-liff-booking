import AppRoutes from './router.jsx'
import { UserProvider } from './context/UserContext.jsx'

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}
