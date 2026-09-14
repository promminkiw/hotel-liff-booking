import { UserProvider } from '../../context/UserContext.jsx'
import LiffGuard from '../../liff/LiffGuard.jsx'
import Layout from './Layout.jsx'

// LIFF only makes sense for the guest-facing pages (opened inside the LINE
// app). Admin is a plain-browser tool with its own JWT auth, so it must
// never trigger a LIFF init or show the "open in LINE" banner - this
// wrapper keeps that scoped to just the guest route tree instead of the
// whole app.
export default function GuestShell() {
  return (
    <UserProvider>
      <LiffGuard>
        <Layout />
      </LiffGuard>
    </UserProvider>
  )
}
