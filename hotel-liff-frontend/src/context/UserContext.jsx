import { createContext, useContext, useMemo, useState } from 'react'

// TEMPORARY STAND-IN for real LINE login. Phase 10 replaces this with
// useLiffProfile() (real LIFF profile + a verified ID token sent on every
// request). Until then we persist a fake "LINE identity" in localStorage
// so bookings and My Bookings behave consistently across page loads - the
// booking API contract (lineUserId + displayName) does not change when
// Phase 10 swaps this out.
const STORAGE_KEY = 'hotel_mock_user'

function loadOrCreateMockUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore corrupt storage, fall through to creating a new identity
  }

  const mockUser = {
    lineUserId: `mock-${crypto.randomUUID()}`,
    displayName: 'ผู้ใช้ทดสอบ',
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
  } catch {
    // localStorage unavailable (private mode, etc.) - identity just won't persist
  }
  return mockUser
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user] = useState(loadOrCreateMockUser)
  const value = useMemo(() => ({ user }), [user])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx.user
}
