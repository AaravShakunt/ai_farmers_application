import { APP_CONFIG } from '../config/app.config'
import { DEFAULT_TRANSLATABLE_CONTENT } from '../config/translatable.config'
import type { TranslatableContent, SupportedLanguageCode } from '../config/translatable.config'

export interface TranslationResponse {
  success: boolean
  data?: {
    translated_elements: Record<string, string>
    translation_info: {
      target_language: string
      target_language_name: string
      total_elements: number
      successful_translations: number
    }
  }
  error?: string
}

export class TranslationService {
  private baseUrl: string
  private cache: Map<string, TranslatableContent> = new Map()
  private currentAbortController: AbortController | null = null

  constructor() {
    this.baseUrl = APP_CONFIG.api.baseUrl
  }

  /**
   * Flatten nested object into dot notation keys
   */
  private flattenObject(obj: any, prefix = ''): Record<string, string> {
    const flattened: Record<string, string> = {}
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey))
        } else if (typeof obj[key] === 'string') {
          flattened[newKey] = obj[key]
        }
      }
    }
    
    return flattened
  }

  /**
   * Reconstruct nested object from flattened dot notation
   */
  private unflattenObject(flattened: Record<string, string>): TranslatableContent {
    const result: any = {}
    
    for (const key in flattened) {
      const keys = key.split('.')
      let current = result
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = flattened[key]
    }
    
    return result as TranslatableContent
  }

  /**
   * Get cached translation or return default
   */
  getCachedTranslation(languageCode: SupportedLanguageCode): TranslatableContent {
    const cached = this.cache.get(languageCode)
    if (cached) {
      return cached
    }
    return DEFAULT_TRANSLATABLE_CONTENT
  }

  /**
   * Check if translation is cached
   */
  isTranslationCached(languageCode: SupportedLanguageCode): boolean {
    return this.cache.has(languageCode)
  }

  /**
   * Translate a batch of UI elements with cancellation support
   */
  private async translateBatch(
    elements: Record<string, string>, 
    targetLanguage: SupportedLanguageCode,
    abortSignal?: AbortSignal
  ): Promise<Record<string, string>> {
    const response = await fetch(`${this.baseUrl}/translate/ui-elements?target_language=${targetLanguage}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elements),
      signal: abortSignal // Add abort signal to request
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const result: TranslationResponse = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Translation failed')
    }

    return result.data.translated_elements
  }

  /**
   * Split content into smaller batches for translation
   */
  private splitIntoBatches(content: Record<string, string>, batchSize: number = 15): Record<string, string>[] {
    const entries = Object.entries(content)
    const batches: Record<string, string>[] = []
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize)
      batches.push(Object.fromEntries(batch))
    }
    
    return batches
  }

  /**
   * Cancel current translation
   */
  cancelTranslation(): void {
    if (this.currentAbortController) {
      console.log('Cancelling translation...')
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }

  /**
   * Translate all UI elements to target language in batches with cancellation support
   */
  async translateContent(targetLanguage: SupportedLanguageCode): Promise<TranslatableContent> {
    try {
      // Cancel any existing translation
      this.cancelTranslation()

      // Return cached translation if available
      if (this.cache.has(targetLanguage)) {
        return this.cache.get(targetLanguage)!
      }

      // Handle English - cache it properly and return
      if (targetLanguage === 'en') {
        this.cache.set(targetLanguage, DEFAULT_TRANSLATABLE_CONTENT)
        return DEFAULT_TRANSLATABLE_CONTENT
      }

      // Create new abort controller for this translation
      this.currentAbortController = new AbortController()
      const abortSignal = this.currentAbortController.signal

      // Flatten the default content for translation
      const flattenedContent = this.flattenObject(DEFAULT_TRANSLATABLE_CONTENT)

      // Split into smaller batches to avoid overwhelming the backend
      const batches = this.splitIntoBatches(flattenedContent, 15)
      const translatedElements: Record<string, string> = {}

      // Translate batches with cancellation support
      await this.translateBatches(batches, targetLanguage, translatedElements, abortSignal)

      // Check if cancelled before completing
      if (abortSignal.aborted) {
        throw new Error('Translation cancelled')
      }

      // Reconstruct the nested object
      const translatedContent = this.unflattenObject(translatedElements)

      // Cache the translation
      this.cache.set(targetLanguage, translatedContent)

      // Clear abort controller on success
      this.currentAbortController = null

      return translatedContent

    } catch (error) {
      // Clear abort controller on error
      this.currentAbortController = null
      
      console.error('Translation error:', error)
      // Throw error to let the UI handle it properly
      throw error
    }
  }

  /**
   * Translate batches in parallel with concurrency control and cancellation support
   */
  private async translateBatches(
    batches: Record<string, string>[], 
    targetLanguage: SupportedLanguageCode, 
    translatedElements: Record<string, string>,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const maxConcurrency = 3 // Process 3 batches in parallel
    const results: Array<{ index: number; result: Record<string, string> | null }> = []

    // Process batches in parallel with concurrency limit
    for (let i = 0; i < batches.length; i += maxConcurrency) {
      // Check if cancelled before processing next group
      if (abortSignal?.aborted) {
        throw new Error('Translation cancelled')
      }

      const batchGroup = batches.slice(i, i + maxConcurrency)
      const batchPromises = batchGroup.map(async (batch, localIndex) => {
        const globalIndex = i + localIndex
        console.log(`Translating batch ${globalIndex + 1}/${batches.length} for ${targetLanguage}`)
        
        try {
          // Check if cancelled before starting batch
          if (abortSignal?.aborted) {
            throw new Error('Translation cancelled')
          }

          // Translate batch with abort signal
          const batchResult = await this.translateBatch(batch, targetLanguage, abortSignal)
          return { index: globalIndex, result: batchResult }
        } catch (batchError: any) {
          // If cancelled, propagate the error
          if (abortSignal?.aborted || batchError?.name === 'AbortError') {
            throw new Error('Translation cancelled')
          }
          
          console.warn(`Batch ${globalIndex + 1} failed, using original text:`, batchError)
          // Use original text for failed batch
          return { index: globalIndex, result: batch }
        }
      })

      // Wait for current group to complete
      const groupResults = await Promise.all(batchPromises)
      results.push(...groupResults)

      // Small delay between batch groups to avoid overwhelming the API
      if (i + maxConcurrency < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Combine all results in order
    results
      .filter(r => r.result !== null)
      .sort((a, b) => a.index - b.index)
      .forEach(r => {
        Object.assign(translatedElements, r.result!)
      })
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get translation progress info
   */
  getTranslationInfo(languageCode: SupportedLanguageCode) {
    return {
      isCached: this.isTranslationCached(languageCode),
      isDefault: languageCode === 'en',
      needsTranslation: languageCode !== 'en' && !this.isTranslationCached(languageCode)
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService()
