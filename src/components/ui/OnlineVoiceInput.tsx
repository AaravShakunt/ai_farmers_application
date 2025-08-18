import { useCallback, useEffect, useState } from 'react'
import { useVoiceRecording } from '../../hooks/useVoiceRecording'
import { useI18n } from '../../i18n'

interface OnlineVoiceInputProps {
  onTranscript: (text: string) => void
  onTranscriptChange?: (text: string) => void
  onRecordingChange?: (isRecording: boolean) => void
  disabled?: boolean
  className?: string
}

export function OnlineVoiceInput({ 
  onTranscript, 
  onTranscriptChange,
  onRecordingChange,
  disabled = false, 
  className = ''
}: OnlineVoiceInputProps) {
  const { lang, t } = useI18n()
  const [isListening, setIsListening] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setShowOfflineMessage(false)
    }
    
    const handleOffline = () => {
      setIsOffline(true)
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 3000)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleTranscriptChange = useCallback((transcript: string) => {
    // Send real-time transcript updates to input field
    if (onTranscriptChange) {
      onTranscriptChange(transcript)
    }
  }, [onTranscriptChange])

  const handleError = useCallback((error: string) => {
    console.error('Voice recording error:', error)
    setIsListening(false)
    
    if (isOffline) {
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 5000)
    }
  }, [isOffline])
  
  const [voiceState, voiceControls] = useVoiceRecording({
    continuous: false,
    interimResults: true,
    language: lang,
    onTranscriptChange: handleTranscriptChange,
    onError: handleError
  })

  useEffect(() => {
    setIsListening(voiceState.isRecording)
    // Notify parent component about recording state changes
    if (onRecordingChange) {
      onRecordingChange(voiceState.isRecording)
    }
  }, [voiceState.isRecording, onRecordingChange])

  // Handle voice completion
  useEffect(() => {
    if (!voiceState.isRecording && voiceState.transcript.trim()) {
      onTranscript(voiceState.transcript.trim())
      voiceControls.clearTranscript()
    }
  }, [voiceState.isRecording, voiceState.transcript, onTranscript, voiceControls])

  const handleToggleRecording = async () => {
    if (!voiceState.isSupported) {
      alert(t('voice_not_supported'))
      return
    }

    if (isOffline && !isListening) {
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 5000)
      return
    }

    if (isListening) {
      voiceControls.stopRecording()
    } else {
      await voiceControls.startRecording()
    }
  }

  // Don't show if voice input is not supported
  if (!voiceState.isSupported) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleRecording}
        disabled={disabled || isOffline}
        className={`p-2.5 rounded-2xl transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : disabled || isOffline
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
        title={
          isOffline 
            ? t('voice_offline_unavailable') 
            : isListening 
            ? t('stop_recording') 
            : t('start_recording')
        }
      >
        {isOffline ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ) : isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}
      </button>

      {/* Connection status indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center">
        {isOffline ? (
          <div className="w-2 h-2 bg-red-500 rounded-full" title="Offline - voice input unavailable" />
        ) : (
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online - voice input available" />
        )}
      </div>

      {/* Real-time transcript display - Mobile optimized */}
      {isListening && voiceState.transcript && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-black bg-opacity-90 text-white text-sm px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-gray-600 md:absolute md:bottom-full md:mb-2 md:left-1/2 md:transform md:-translate-x-1/2 md:top-auto md:left-auto md:right-auto md:max-w-xs md:text-xs md:px-3 md:py-2">
          <div className="text-center">
            <div className="opacity-75 text-xs md:text-xs">{t('listening')}...</div>
            <div className="mt-1 font-medium break-words">{voiceState.transcript}</div>
          </div>
        </div>
      )}

      {/* Error display */}
      {voiceState.error && !isOffline && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-xs">
          <div className="text-center">
            <div>{voiceState.error}</div>
          </div>
        </div>
      )}

      {/* Offline message */}
      {showOfflineMessage && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-xs">
          <div className="text-center">
            <div className="font-medium">{t('offline_mode')}</div>
            <div className="mt-1">{t('voice_requires_internet')}</div>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isListening && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}

      {/* Helpful tip when disabled due to offline */}
      {isOffline && (
        <div className="absolute bottom-full mb-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            <div className="text-center">
              <div className="font-medium">Voice input requires internet</div>
              <div className="mt-1 opacity-75">Reconnect to use voice features</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
