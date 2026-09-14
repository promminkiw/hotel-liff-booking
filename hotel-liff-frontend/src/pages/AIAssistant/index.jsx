import { useEffect, useRef, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { fetchMessages, sendChatMessage } from '../../api/aiApi.js'
import ChatBubble from '../../components/ai/ChatBubble.jsx'
import LoginPrompt from '../../components/common/LoginPrompt.jsx'

export default function AIAssistant() {
  const { profile, idToken, loading: userLoading, login } = useUser()
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    fetchMessages(idToken)
      .then((data) => setMessages(data.messages))
      .catch((err) => setError(err))
      .finally(() => setLoadingHistory(false))
  }, [profile, idToken])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setSending(true)

    try {
      const { reply } = await sendChatMessage(idToken, text)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err)
    } finally {
      setSending(false)
    }
  }

  if (userLoading) {
    return <p>กำลังโหลด...</p>
  }

  if (!profile) {
    return <LoginPrompt onLogin={login} message="เข้าสู่ระบบด้วย LINE เพื่อคุยกับ AI Assistant" />
  }

  return (
    <section className="ai-assistant">
      <h1>AI Assistant</h1>

      <div className="chat-window">
        {loadingHistory && <p>กำลังโหลด...</p>}
        {!loadingHistory && messages.length === 0 && (
          <p className="chat-empty">สวัสดีครับ มีอะไรให้ช่วยเกี่ยวกับโรงแรมไหมครับ?</p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && error.status === 401 && (
        <LoginPrompt onLogin={login} message="เซสชัน LINE หมดอายุ กรุณาเข้าสู่ระบบใหม่" />
      )}
      {error && error.status !== 401 && <p className="error-text">{error.message}</p>}

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          disabled={sending}
        />
        <button type="submit" className="btn-primary" disabled={sending || !input.trim()}>
          {sending ? '...' : 'ส่ง'}
        </button>
      </form>
    </section>
  )
}
