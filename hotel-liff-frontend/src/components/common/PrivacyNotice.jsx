import { useState } from 'react'

const STORAGE_KEY = 'privacy_notice_dismissed'

function loadDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

// PDPA: a short, non-blocking notice about what LINE profile data this app
// collects and why, shown once until dismissed. Not a consent gate - the
// app already only reads what LIFF's profile/openid scope grants.
export default function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(loadDismissed)

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage unavailable - notice will just show again next visit
    }
  }

  return (
    <div className="privacy-notice">
      <p>
        แอปนี้เก็บข้อมูลโปรไฟล์ LINE ของคุณ (ชื่อ, รูปโปรไฟล์, LINE User ID) เพื่อใช้ยืนยันตัวตนและผูกกับการจองของคุณเท่านั้น
        ไม่นำไปใช้เพื่อวัตถุประสงค์อื่น
      </p>
      <button type="button" className="privacy-notice-close" onClick={handleDismiss} aria-label="ปิดข้อความนี้">
        ✕
      </button>
    </div>
  )
}
