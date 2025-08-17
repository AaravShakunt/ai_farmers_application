// Simple Whisper worker for background model loading and transcription
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'

let transcriber = null

self.onmessage = async function(event) {
  const { type, data } = event.data

  try {
    switch (type) {
      case 'load':
        if (!transcriber) {
          self.postMessage({ type: 'progress', progress: 0 })
          
          transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-tiny.en',
            {
              quantized: true,
              progress_callback: (progressData) => {
                if (progressData.status === 'downloading') {
                  const percent = Math.round((progressData.loaded / progressData.total) * 100)
                  self.postMessage({ type: 'progress', progress: percent })
                }
              }
            }
          )
          
          self.postMessage({ type: 'loaded' })
        } else {
          self.postMessage({ type: 'loaded' })
        }
        break

      case 'transcribe':
        if (!transcriber) {
          self.postMessage({ type: 'error', error: 'Model not loaded' })
          return
        }

        const result = await transcriber(data.audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
          task: 'transcribe'
        })

        self.postMessage({ 
          type: 'transcription', 
          transcript: result.text?.trim() || '' 
        })
        break

      default:
        self.postMessage({ type: 'error', error: 'Unknown message type' })
    }
  } catch (error) {
    console.error('Worker error:', error)
    self.postMessage({ 
      type: 'error', 
      error: error.message || 'An error occurred' 
    })
  }
}