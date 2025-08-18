import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { translationService } from '../services/translationApi'
import type { TranslatableContent, SupportedLanguageCode } from '../config/translatable.config'
import { DEFAULT_TRANSLATABLE_CONTENT, SUPPORTED_LANGUAGES } from '../config/translatable.config'

interface TranslationContextType {
  // Current translated content
  content: TranslatableContent
  
  // Current language
  currentLanguage: SupportedLanguageCode
  
  // Translation state
  isTranslating: boolean
  translationError: string | null
  
  // Available languages
  supportedLanguages: typeof SUPPORTED_LANGUAGES
  
  // Actions
  changeLanguage: (languageCode: SupportedLanguageCode) => Promise<void>
  retryTranslation: () => Promise<void>
  skipTranslation: () => void
  
  // Helper function to get translated text
  t: (path: string) => string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

interface TranslationProviderProps {
  children: ReactNode
  initialLanguage?: SupportedLanguageCode
}

export function TranslationProvider({ children, initialLanguage = 'en' }: TranslationProviderProps) {
  const [content, setContent] = useState<TranslatableContent>(DEFAULT_TRANSLATABLE_CONTENT)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>(initialLanguage)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)

  // Helper function to get nested property value using dot notation
  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return path // Return the path itself if not found
      }
    }
    
    return typeof current === 'string' ? current : path
  }

  // Translation function
  const t = (path: string): string => {
    return getNestedValue(content, path)
  }

  // Change language function
  const changeLanguage = async (languageCode: SupportedLanguageCode) => {
    if (languageCode === currentLanguage) {
      return // No change needed
    }

    // Set the target language immediately so modal shows correct language
    setCurrentLanguage(languageCode)
    setIsTranslating(true)
    setTranslationError(null)

    try {
      // Always show loading for any language change (including English)
      await new Promise(resolve => setTimeout(resolve, 500)) // Minimum loading time
      
      // Get translation info
      const translationInfo = translationService.getTranslationInfo(languageCode)
      
      if (translationInfo.isCached || translationInfo.isDefault) {
        // Use cached or default content
        const translatedContent = translationService.getCachedTranslation(languageCode)
        setContent(translatedContent)
        setIsTranslating(false)
      } else {
        // Need to fetch translation from backend
        const translatedContent = await translationService.translateContent(languageCode)
        setContent(translatedContent)
        setIsTranslating(false)
      }
    } catch (error) {
      console.error('Translation failed:', error)
      setTranslationError(error instanceof Error ? error.message : 'Translation failed')
      setIsTranslating(false)
      
      // Don't automatically fallback - let user decide
      // setContent(DEFAULT_TRANSLATABLE_CONTENT)
    }
  }

  // Retry translation function
  const retryTranslation = async () => {
    if (currentLanguage !== 'en') {
      // Clear cache for current language and retry
      translationService.clearCache()
      await changeLanguage(currentLanguage)
    }
  }

  // Skip translation function - cancel ongoing requests and fallback to English
  const skipTranslation = () => {
    // Cancel any ongoing translation requests
    translationService.cancelTranslation()
    
    setIsTranslating(false)
    setTranslationError(null)
    setCurrentLanguage('en')
    setContent(DEFAULT_TRANSLATABLE_CONTENT)
    // Don't set language-selection-completed to true when skipping due to failure
    // This ensures user goes back to language selection on refresh
    localStorage.setItem('selected-language', 'en')
    localStorage.setItem('language-selected', 'true')
  }

  // Initialize with saved language or default
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selected-language') as SupportedLanguageCode
    
    // Always ensure English is cached on startup
    translationService.getCachedTranslation('en')
    
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage)
    } else if (initialLanguage !== 'en' && initialLanguage !== currentLanguage) {
      changeLanguage(initialLanguage)
    }
  }, [initialLanguage])

  const contextValue: TranslationContextType = {
    content,
    currentLanguage,
    isTranslating,
    translationError,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    retryTranslation,
    skipTranslation,
    t
  }

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  )
}

// Hook to use translation context
export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Translation Loading Component
export function TranslationLoader() {
  const { isTranslating, translationError, retryTranslation, skipTranslation, currentLanguage, supportedLanguages } = useTranslation()

  if (!isTranslating && !translationError) {
    return null
  }

  const currentLanguageName = supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName || currentLanguage

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center relative">
        {/* Close button - always visible */}
        <button
          onClick={skipTranslation}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Skip translation and use English"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isTranslating ? (
          <>
            {/* Simple Loading Text */}
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Translating to {currentLanguageName}
            </h3>
            
            {/* Progress Slider */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div className="bg-green-500 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
          </>
        ) : translationError ? (
          <>
            {/* Error State */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Translation Failed
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Unable to translate to {currentLanguageName}. You can retry or continue with English.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={retryTranslation}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Retry
              </button>
              <button
                onClick={skipTranslation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Use English
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
