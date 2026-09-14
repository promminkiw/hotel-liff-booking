import { useState } from 'react'
import { isSpeechRecognitionSupported, startListening, stopListening } from '../../services/voiceService.js'

const ERROR_LABELS = {
  'not-allowed': 'กรุณาอนุญาตให้ใช้ไมโครโฟน',
  'no-speech': 'ไม่ได้ยินเสียงพูด ลองอีกครั้ง',
}

export default function MicButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)

  if (!isSpeechRecognitionSupported()) {
    return null
  }

  function handleClick() {
    if (listening) {
      stopListening()
      return
    }

    setError(null)
    setListening(true)
    startListening({
      onResult: (transcript) => onTranscript(transcript),
      onError: (err) => {
        setError(ERROR_LABELS[err] ?? 'เกิดข้อผิดพลาดในการฟังเสียง')
        setListening(false)
      },
      onEnd: () => setListening(false),
    })
  }

  return (
    <div className="mic-button-wrap">
      <button
        type="button"
        className={`mic-button ${listening ? 'mic-button-active' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        title={listening ? 'กำลังฟัง... คลิกเพื่อหยุด' : 'พูดเพื่อพิมพ์ข้อความ'}
      >
        {listening ? '⏹' : '🎤'}
      </button>
      {error && <span className="mic-error">{error}</span>}
    </div>
  )
}
