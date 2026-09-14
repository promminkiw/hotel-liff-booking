import { useUser } from '../context/UserContext.jsx'

// Non-blocking: the app is still usable outside the LINE app (useful for
// local dev and for anyone who opens the link in a normal browser), but we
// tell them clearly so a missing microphone permission or odd layout isn't
// mysterious.
export default function LiffGuard({ children }) {
  const { loading, error, isInClient } = useUser()

  if (loading) {
    return <div className="liff-loading">กำลังเชื่อมต่อ LINE...</div>
  }

  return (
    <>
      {error && (
        <div className="liff-banner liff-banner-error">เชื่อมต่อ LINE ไม่สำเร็จ: {error}</div>
      )}
      {!error && !isInClient && (
        <div className="liff-banner">
          คุณกำลังเปิดนอกแอป LINE — เพื่อประสบการณ์เต็มรูปแบบ กรุณาเปิดผ่านแอป LINE
        </div>
      )}
      {children}
    </>
  )
}
