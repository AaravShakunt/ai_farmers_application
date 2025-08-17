import { useCallback, useEffect, useRef, useState } from 'react'
import { pipeline, AutomaticSpeechRecognitionPipeline } from '@xenova/transformers'

export interface OptimizedOfflineVoiceState {
  isRecording: boolean
  isLoading: boolean
  isModelReady: boolean
  isTranscribing: boolean
  transcript: string
  error: string | null
  progress: number
}

export interface OptimizedOfflineVoiceControls {
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
}

interface UseOptimizedOfflineVoiceOptions {
  language?: string
  onTranscriptChange?: (transcript: string) => void
  onError?: (error: string) => void
  modelSize?: 'tiny' | 'base' | 'small'
}

// Global instance to avoid reloading the model
let globalTranscriber: AutomaticSpeechRecognitionPipeline | null = null
let isLoadingGlobalTranscriber = false

export function useOptimizedOfflineVoice(options: UseOptimizedOfflineVoiceOptions = {}): [OptimizedOfflineVoiceState, OptimizedOfflineVoiceControls] {
  const {
    language = 'en',
    onTranscriptChange,
    onError,
    modelSize = 'tiny'
  } = options

  const [state, setState] = useState<OptimizedOfflineVoiceState>({
    isRecording: false,
    isLoading: false,
    isModelReady: false,
    isTranscribing: false,
    transcript: '',
    error: null,
    progress: 0
  })

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Load the Whisper model once globally
  useEffect(() => {
    const loadModel = async () => {
      if (globalTranscriber) {
        setState(prev => ({ ...prev, isModelReady: true, isLoading: false }))
        return
      }

      if (isLoadingGlobalTranscriber) {
        // Wait for existing load to complete
        const checkLoaded = setInterval(() => {
          if (globalTranscriber && !isLoadingGlobalTranscriber) {
            setState(prev => ({ ...prev, isModelReady: true, isLoading: false }))
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, progress: 0 }))
        isLoadingGlobalTranscriber = true
        
        // Use the English-only model for better performance and reliability
        const modelName = language === 'en' ? `Xenova/whisper-${modelSize}.en` : `Xenova/whisper-${modelSize}`
        
        globalTranscriber = await pipeline(
          'automatic-speech-recognition',
          modelName,
          {
            quantized: true,
            progress_callback: (progress: any) => {
              if (progress.status === 'downloading') {
                const percent = Math.round((progress.loaded / progress.total) * 100)
                setState(prev => ({ ...prev, progress: percent }))
              }
            }
          }
        )

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isModelReady: true, 
          progress: 100,
          error: null
        }))
        
        isLoadingGlobalTranscriber = false
      } catch (error) {
        console.error('Failed to load Whisper model:', error)
        isLoadingGlobalTranscriber = false
        
        const errorMsg = 'Failed to load offline voice recognition model'
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMsg
        }))
        
        if (onError) {
          onError(errorMsg)
        }
      }
    }

    loadModel()
  }, [language, modelSize, onError])

  // Handle transcript changes
  useEffect(() => {
    if (state.transcript && onTranscriptChange) {
      onTranscriptChange(state.transcript)
    }
  }, [state.transcript, onTranscriptChange])

  const startRecording = useCallback(async () => {
    if (!globalTranscriber) {
      setState(prev => ({ ...prev, error: 'Voice recognition model not loaded' }))
      return
    }

    if (state.isRecording) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      streamRef.current = stream
      audioChunks.current = []

      // Create MediaRecorder with best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm'

      mediaRecorder.current = new MediaRecorder(stream, { mimeType })

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = async () => {
        try {
          setState(prev => ({ ...prev, isTranscribing: true }))
          
          // Create audio blob
          const audioBlob = new Blob(audioChunks.current, { type: mimeType })
          
          // Convert blob to audio buffer for Whisper
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioContext = new AudioContext({ sampleRate: 16000 })
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Get audio data as Float32Array
          const audioData = audioBuffer.getChannelData(0)
          
          // Transcribe with Whisper
          if (globalTranscriber) {
            const result = await globalTranscriber(audioData, {
              language: getWhisperLanguageCode(language),
              task: 'transcribe',
              return_timestamps: false
            })
            
            const transcript = Array.isArray(result) ? result[0]?.text?.trim() || '' : result.text?.trim() || ''
            
            setState(prev => ({ 
              ...prev, 
              transcript,
              isTranscribing: false,
              error: null
            }))
          }
        } catch (error) {
          console.error('Transcription error:', error)
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to transcribe audio',
            isTranscribing: false
          }))
          
          if (onError) {
            onError('Failed to transcribe audio')
          }
        } finally {
          // Clean up stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
        }
      }

      // Start recording
      mediaRecorder.current.start()
      setState(prev => ({ ...prev, isRecording: true, error: null }))

    } catch (error) {
      console.error('Failed to start recording:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access microphone. Please allow microphone access.' 
      }))
      
      if (onError) {
        onError('Failed to access microphone. Please allow microphone access.')
      }
    }
  }, [state.isRecording, language, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stop()
      setState(prev => ({ ...prev, isRecording: false }))
    }
  }, [state.isRecording])

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
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

function getWhisperLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    'en': 'en',
    'hi': 'hi',
    'kn': 'kn',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ru': 'ru',
    'ja': 'ja',
    'ko': 'ko',
    'zh': 'zh',
    'ar': 'ar'
  }

  return languageMap[language] || 'en'
}