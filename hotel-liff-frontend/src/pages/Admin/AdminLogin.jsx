import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../api/adminApi.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { token } = await adminLogin(password)
      login(token)
      navigate('/admin/rooms')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page admin-login-page">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่าน"
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={submitting || !password}>
          {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  )
}
