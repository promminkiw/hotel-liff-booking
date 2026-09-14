import { createContext, useContext } from 'react'
import { useLiffProfile } from '../liff/useLiffProfile.js'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const liffState = useLiffProfile()
  return <UserContext.Provider value={liffState}>{children}</UserContext.Provider>
}

// Returns { loading, error, profile, idToken, isInClient, login, logout }.
// profile is null until the user is logged in with LINE - callers must
// handle that (show a login prompt) rather than assume it's always set.
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
