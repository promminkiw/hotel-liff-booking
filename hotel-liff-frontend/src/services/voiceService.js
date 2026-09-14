// Thin wrapper over the browser's native SpeechRecognition/SpeechSynthesis
// APIs. Kept separate from any component so a future switch to an external
// STT/TTS provider (per the original design doc) only touches this file -
// callers only ever see the functions exported below.
const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

let recognition = null

export function isSpeechRecognitionSupported() {
  return Boolean(SpeechRecognitionImpl)
}

export function startListening({ onResult, onError, onEnd }) {
  if (!SpeechRecognitionImpl) {
    onError?.('เบราว์เซอร์นี้ไม่รองรับการพูด')
    return
  }

  recognition = new SpeechRecognitionImpl()
  recognition.lang = 'th-TH'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult?.(transcript)
  }
  recognition.onerror = (event) => {
    onError?.(event.error)
  }
  recognition.onend = () => {
    onEnd?.()
  }

  recognition.start()
}

export function stopListening() {
  recognition?.stop()
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, { onEnd } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return

  // Cancel whatever's currently playing so replies don't stack/overlap.
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'th-TH'
  utterance.onend = () => onEnd?.()
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}
