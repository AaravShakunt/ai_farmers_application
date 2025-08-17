import { useState, useRef, useCallback, useEffect } from 'react'
import { whisperService } from '../../services/whisperService'
import { useI18n } from '../../i18n'

interface OfflineVoiceInputProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
}

export function OfflineVoiceInput({ 
  onTranscript, 
  disabled = false, 
  className = '' 
}: OfflineVoiceInputProps) {
  const { } = useI18n()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const convertBlobToFloat32Array = useCallback(async (blob: Blob): Promise<Float32Array> => {
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const sampleRate = 16000
    const length = Math.floor(audioBuffer.duration * sampleRate)
    const resampledBuffer = new Float32Array(length)
    
    const sourceData = audioBuffer.getChannelData(0)
    const sourceLength = sourceData.length
    
    for (let i = 0; i < length; i++) {
      const sourceIndex = Math.floor((i * sourceLength) / length)
      resampledBuffer[i] = sourceData[sourceIndex]
    }
    
    return resampledBuffer
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    
    if (!whisperService.isReady() && !whisperService.isInitializing()) {
      setIsModelLoading(true)
      setLoadingProgress('Initializing speech recognition...')
      try {
        await whisperService.initialize()
        setLoadingProgress('')
      } catch (err) {
        setError('Failed to load speech recognition model. Please check your internet connection.')
        setIsModelLoading(false)
        setLoadingProgress('')
        return
      }
      setIsModelLoading(false)
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
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioData = await convertBlobToFloat32Array(audioBlob)
          
          const transcript = await whisperService.transcribe(audioData)
          
          if (transcript.trim()) {
            onTranscript(transcript)
          }
        } catch (err) {
          console.error('Transcription error:', err)
          setError('Failed to transcribe audio')
        } finally {
          setIsProcessing(false)
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access error:', err)
      setError('Microphone access denied')
    }
  }, [onTranscript, convertBlobToFloat32Array])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const isActive = isRecording || isProcessing || isModelLoading
  const buttonDisabled = disabled || isProcessing || isModelLoading

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleRecording}
        disabled={buttonDisabled}
        className={`p-2.5 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        } ${
          buttonDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
        }`}
        title={
          isModelLoading 
            ? loadingProgress || 'Loading speech model...'
            : isProcessing 
            ? 'Processing audio...'
            : isRecording 
            ? 'Stop recording' 
            : 'Start offline voice input'
        }
      >
        {isModelLoading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : isProcessing ? (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : isRecording ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Mode indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-green-500 rounded-full" title="Offline mode - Whisper" />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}

      {/* Status messages */}
      {isModelLoading && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="text-center">
            <div className="opacity-75">Loading model...</div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="text-center">
            <div className="opacity-75">Processing...</div>
          </div>
        </div>
      )}

      {isRecording && !isProcessing && !isModelLoading && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          <div className="text-center">
            <div className="opacity-75">Recording...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-xs z-50">
          <div className="text-center">{error}</div>
        </div>
      )}
    </div>
  )
}