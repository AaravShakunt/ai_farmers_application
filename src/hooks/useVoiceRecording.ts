import { useCallback, useEffect, useRef, useState } from 'react'

export interface VoiceRecordingState {
  isRecording: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  confidence: number
}

export interface VoiceRecordingControls {
  startRecording: () => void
  stopRecording: () => void
  clearTranscript: () => void
}

interface UseVoiceRecordingOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onTranscriptChange?: (transcript: string) => void
  onError?: (error: string) => void
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}): [VoiceRecordingState, VoiceRecordingControls] {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onTranscriptChange,
    onError
  } = options

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isSupported: false,
    transcript: '',
    error: null,
    confidence: 0
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check for browser support and initialize recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    setState(prev => ({ ...prev, isSupported }))

    if (isSupported) {
      recognitionRef.current = new SpeechRecognition()
      const recognition = recognitionRef.current

      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = getLanguageCode(language)

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isRecording: true, error: null }))
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let confidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript
            confidence = result[0].confidence
          } else {
            interimTranscript += transcript
          }
        }

        const combinedTranscript = finalTranscript || interimTranscript

        setState(prev => ({
          ...prev,
          transcript: combinedTranscript,
          confidence: confidence || prev.confidence
        }))
      }

      recognition.onerror = (event) => {
        const errorMessage = getErrorMessage(event.error)
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isRecording: false
        }))
      }

      recognition.onend = () => {
        setState(prev => ({ ...prev, isRecording: false }))
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, interimResults, language])

  // Handle transcript changes separately to avoid infinite loops
  const onTranscriptChangeRef = useRef(onTranscriptChange)
  const onErrorRef = useRef(onError)
  
  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange
  }, [onTranscriptChange])
  
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (state.transcript && onTranscriptChangeRef.current) {
      onTranscriptChangeRef.current(state.transcript)
    }
  }, [state.transcript])

  useEffect(() => {
    if (state.error && onErrorRef.current) {
      onErrorRef.current(state.error)
    }
  }, [state.error])

  const startRecording = useCallback(async () => {
    if (!state.isSupported || !recognitionRef.current) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }))
      return
    }

    if (state.isRecording) {
      return
    }

    // Request microphone permission first
    try {
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Close the stream immediately as we only needed permission
      permission.getTracks().forEach(track => track.stop())
      
      // Now start speech recognition
      recognitionRef.current.start()
    } catch (permissionError) {
      console.error('Microphone permission error:', permissionError)
      setState(prev => ({ 
        ...prev, 
        error: 'Microphone access denied. Please allow microphone access and try again.' 
      }))
    }
  }, [state.isSupported, state.isRecording])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state.isRecording) {
      recognitionRef.current.stop()
    }
  }, [state.isRecording])

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null, confidence: 0 }))
  }, [])

  return [
    state,
    {
      startRecording,
      stopRecording,
      clearTranscript
    }
  ]
}

function getLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'en-US': 'en-US',
    'hi-IN': 'hi-IN',
    'kn-IN': 'kn-IN'
  }

  return languageMap[language] || 'en-US'
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'network':
      return 'Please allow microphone access in your browser and try again'
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone access in your browser settings'
    case 'no-speech':
      return 'No speech detected. Please speak clearly and try again'
    case 'aborted':
      return 'Recording was stopped'
    case 'audio-capture':
      return 'Unable to access microphone. Please check your microphone connection'
    case 'service-not-allowed':
      return 'Speech recognition service not available'
    default:
      return 'Voice recognition error. Please try again'
  }
}