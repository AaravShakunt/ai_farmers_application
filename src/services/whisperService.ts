import { pipeline, Pipeline, env } from '@xenova/transformers'

// Configure transformers environment
env.allowRemoteModels = true
env.allowLocalModels = false

interface WhisperServiceConfig {
  modelName?: string
  language?: string
  task?: 'transcribe' | 'translate'
}

class WhisperService {
  private transcriber: Pipeline | null = null
  private isLoading = false
  private config: WhisperServiceConfig

  constructor(config: WhisperServiceConfig = {}) {
    this.config = {
      modelName: 'Xenova/whisper-tiny.en',
      language: 'english',
      task: 'transcribe',
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (this.transcriber || this.isLoading) return

    this.isLoading = true
    try {
      // Try different model configurations in order of preference
      const modelConfigs = [
        {
          name: 'Xenova/whisper-tiny.en',
          options: { quantized: true, device: 'webgpu' }
        },
        {
          name: 'Xenova/whisper-tiny.en',
          options: { quantized: true }
        },
        {
          name: 'Xenova/whisper-base.en',
          options: { quantized: true }
        }
      ]

      for (const config of modelConfigs) {
        try {
          console.log(`Attempting to load model: ${config.name}`)
          this.transcriber = await pipeline(
            'automatic-speech-recognition',
            config.name,
            {
              ...config.options,
              progress_callback: (data: any) => {
                if (data.status === 'downloading') {
                  console.log(`Downloading: ${data.name} - ${Math.round(data.progress || 0)}%`)
                }
              }
            }
          )
          console.log(`Successfully loaded model: ${config.name}`)
          break
        } catch (modelError) {
          console.warn(`Failed to load ${config.name}:`, modelError)
          continue
        }
      }

      if (!this.transcriber) {
        throw new Error('All model configurations failed to load')
      }
    } catch (error) {
      console.error('Failed to initialize Whisper model:', error)
      throw new Error('Failed to load speech recognition model. Please check your internet connection and try again.')
    } finally {
      this.isLoading = false
    }
  }

  async transcribe(audioBuffer: Float32Array, _sampleRate: number = 16000): Promise<string> {
    if (!this.transcriber) {
      await this.initialize()
    }

    if (!this.transcriber) {
      throw new Error('Whisper model not initialized')
    }

    try {
      const result = await this.transcriber(audioBuffer, {
        language: this.config.language,
        task: this.config.task,
        return_timestamps: false,
      })

      return result.text.trim()
    } catch (error) {
      console.error('Transcription failed:', error)
      throw new Error('Failed to transcribe audio')
    }
  }

  isReady(): boolean {
    return this.transcriber !== null
  }

  isInitializing(): boolean {
    return this.isLoading
  }
}

export const whisperService = new WhisperService()