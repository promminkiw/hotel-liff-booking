import { useEffect, useRef, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { fetchMessages, sendChatMessage } from '../../api/aiApi.js'
import ChatBubble from '../../components/ai/ChatBubble.jsx'
import MicButton from '../../components/ai/MicButton.jsx'
import LoginPrompt from '../../components/common/LoginPrompt.jsx'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '../../services/voiceService.js'

const VOICE_PREF_KEY = 'hotel_ai_voice_enabled'

function loadVoicePref() {
  try {
    return localStorage.getItem(VOICE_PREF_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AIAssistant() {
  const { profile, idToken, loading: userLoading, login } = useUser()
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  // Default off: browsers restrict audio autoplay without a user gesture,
  // and unprompted speech from a chat reply would be surprising anyway -
  // the user explicitly opts in via the toggle below.
  const [voiceEnabled, setVoiceEnabled] = useState(loadVoicePref)
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

  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  function toggleVoice() {
    const next = !voiceEnabled
    setVoiceEnabled(next)
    if (!next) stopSpeaking()
    try {
      localStorage.setItem(VOICE_PREF_KEY, String(next))
    } catch {
      // localStorage unavailable - preference just won't persist across reloads
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    stopSpeaking()
    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setSending(true)

    try {
      const { reply } = await sendChatMessage(idToken, text)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      if (voiceEnabled) speak(reply)
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
      <div className="ai-assistant-header">
        <h1>AI Assistant</h1>
        {isSpeechSynthesisSupported() && (
          <button
            type="button"
            className="voice-toggle"
            onClick={toggleVoice}
            title={voiceEnabled ? 'ปิดเสียงตอบกลับ' : 'เปิดให้ AI พูดตอบกลับ'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
        )}
      </div>

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
        <MicButton onTranscript={(text) => setInput(text)} disabled={sending} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์ข้อความ หรือกดไมค์เพื่อพูด..."
          disabled={sending}
        />
        <button type="submit" className="btn-primary" disabled={sending || !input.trim()}>
          {sending ? '...' : 'ส่ง'}
        </button>
      </form>
    </section>
  )
}
