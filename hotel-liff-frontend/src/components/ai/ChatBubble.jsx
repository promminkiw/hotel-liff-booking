export default function ChatBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`chat-bubble-row ${isUser ? 'chat-bubble-row-user' : ''}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>{content}</div>
    </div>
  )
}
