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

// Caching functionality disabled for testing

export async function predictByCategory(category: ImageCategory, file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${APP_CONFIG.api.baseUrl}/ml/predict/${category}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(`Prediction failed: ${errorData.detail || response.statusText}`)
  }

  return await response.json()
}

export async function analyzeImage(category: ImageCategory, file: File): Promise<{ result: string }> {
  try {
    // Make prediction using category-specific endpoint (caching disabled for testing)
    const prediction = await predictByCategory(category, file)
    
    let result: string
    
    if (category === 'soil' && prediction.results) {
      // Handle soil predictions with multiple results
      result = `Soil Analysis Results:\n\n${prediction.summary}\n\nDetailed Results:\n`
      for (const [type, data] of Object.entries(prediction.results)) {
        const typedData = data as { prediction: string; confidence: number }
        result += `• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${typedData.prediction} (${Math.round(typedData.confidence * 100)}%)\n`
      }
    } else {
      // Handle single predictions (plant, insect, leaf)
      const confidence = Math.round(prediction.confidence * 100)
      result = `${category.charAt(0).toUpperCase() + category.slice(1)} Analysis:\n\n`
      result += `Detected: ${prediction.label} (${confidence}% confidence)\n\n`
      
      if (prediction.top3) {
        result += `Top 3 predictions:\n${prediction.top3
          .map((pred: any, idx: number) => `${idx + 1}. ${pred.label}: ${Math.round(pred.confidence * 100)}%`)
          .join('\n')}`
      }
    }
    
    return { result }
  } catch (error) {
    console.error('ML prediction error:', error)
    return { 
      result: `Error: Could not analyze image. ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}