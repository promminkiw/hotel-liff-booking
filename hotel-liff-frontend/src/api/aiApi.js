import { httpClient } from './httpClient.js'

function authHeaders(idToken) {
  return { headers: { Authorization: `Bearer ${idToken}` } }
}

export function fetchMessages(idToken) {
  return httpClient.get('/api/ai/messages', authHeaders(idToken))
}

export function sendChatMessage(idToken, message) {
  return httpClient.post('/api/ai/chat', { message }, authHeaders(idToken))
}
