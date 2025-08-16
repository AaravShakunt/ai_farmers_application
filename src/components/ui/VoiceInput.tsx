import { useCallback, useEffect, useState } from 'react'
import { useVoiceRecording } from '../../hooks/useVoiceRecording'
import { useI18n } from '../../i18n'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, disabled = false, className = '' }: VoiceInputProps) {
  const { lang, t } = useI18n()
  const [isListening, setIsListening] = useState(false)
  
  const handleTranscriptChange = useCallback((transcript: string) => {
    // Don't call onTranscript during recording, only store the transcript
  }, [])

  const handleError = useCallback((error: string) => {
    console.error('Voice recording error:', error)
    setIsListening(false)
  }, [])
  
  const [voiceState, voiceControls] = useVoiceRecording({
    continuous: false,
    interimResults: true,
    language: lang,
    onTranscriptChange: handleTranscriptChange,
    onError: handleError
  })

  useEffect(() => {
    setIsListening(voiceState.isRecording)
  }, [voiceState.isRecording])

  useEffect(() => {
    if (!voiceState.isRecording && voiceState.transcript.trim()) {
      const transcript = voiceState.transcript.trim()
      onTranscript(transcript)
      voiceControls.clearTranscript()
    }
  }, [voiceState.isRecording, voiceState.transcript, onTranscript, voiceControls.clearTranscript])

  const handleToggleRecording = async () => {
    if (!voiceState.isSupported) {
      alert(t('voice_not_supported'))
      return
    }

    if (voiceState.isRecording) {
      voiceControls.stopRecording()
    } else {
      await voiceControls.startRecording()
    }
  }

  if (!voiceState.isSupported) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`p-2.5 rounded-2xl transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
        title={isListening ? t('stop_recording') : t('start_recording')}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}
      </button>

      {/* Real-time transcript display */}
      {isListening && voiceState.transcript && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-xs overflow-hidden">
          <div className="text-center">
            <div className="opacity-75">{t('listening')}...</div>
            <div className="mt-1 font-medium">{voiceState.transcript}</div>
          </div>
        </div>
      )}

      {/* Error display */}
      {voiceState.error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          {voiceState.error}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  )
}