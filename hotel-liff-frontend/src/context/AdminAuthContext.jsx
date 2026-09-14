import { createContext, useCallback, useContext, useState } from 'react'

const STORAGE_KEY = 'admin_token'

function loadToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(loadToken)

  const login = useCallback((newToken) => {
    setToken(newToken)
    try {
      localStorage.setItem(STORAGE_KEY, newToken)
    } catch {
      // localStorage unavailable - session just won't survive a reload
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return <AdminAuthContext.Provider value={{ token, login, logout }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
