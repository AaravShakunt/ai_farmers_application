import type { ImageCategory } from '../types'
import { APP_CONFIG } from '../config'

export interface MLPrediction {
  label: string
  confidence: number
  top3: Array<{
    label: string
    confidence: number
  }>
}

export async function predictWithCNN(file: File): Promise<MLPrediction> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${APP_CONFIG.api.baseUrl}/ml/cnn-predict`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(`CNN prediction failed: ${errorData.detail || response.statusText}`)
  }

  return await response.json()
}

export async function analyzeImage(category: ImageCategory, file: File): Promise<{ result: string }> {
  try {
    const prediction = await predictWithCNN(file)
    const confidence = Math.round(prediction.confidence * 100)
    
    const result = `Disease Detected: ${prediction.label} (${confidence}% confidence)\n\nTop 3 predictions:\n${prediction.top3
      .map((pred, idx) => `${idx + 1}. ${pred.label}: ${Math.round(pred.confidence * 100)}%`)
      .join('\n')}`
    
    return { result }
  } catch (error) {
    console.error('ML prediction error:', error)
    return { 
      result: `Error: Could not analyze image. ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}