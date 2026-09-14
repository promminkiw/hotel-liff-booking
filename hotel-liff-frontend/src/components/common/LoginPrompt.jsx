export default function LoginPrompt({ onLogin, message = 'กรุณาเข้าสู่ระบบด้วย LINE เพื่อดำเนินการต่อ' }) {
  return (
    <div className="login-prompt">
      <p>{message}</p>
      <button className="btn-primary" onClick={onLogin}>
        เข้าสู่ระบบด้วย LINE
      </button>
    </div>
  )
}
