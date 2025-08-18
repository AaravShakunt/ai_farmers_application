// Simplified Translatable Content Configuration for Testing
// Only navigation items to test translation flow

export interface TranslatableContent {
  // Navigation & UI - ONLY THESE FOR TESTING
  navigation: {
    home: string
    chatbot: string
    images: string
    settings: string
    tasks: string
    workflow: string
  }
  
  // Language Selection - Keep minimal for functionality
  language: {
    title: string
    choose_language: string
  }
  
  // Common UI Elements - Keep minimal
  common: {
    continue: string
    loading: string
  }
}

// Default English content - SIMPLIFIED FOR TESTING
export const DEFAULT_TRANSLATABLE_CONTENT: TranslatableContent = {
  navigation: {
    home: 'Home',
    chatbot: 'Chat',
    images: 'Images', 
    settings: 'Settings',
    tasks: 'Tasks',
    workflow: 'Workflow'
  },
  
  language: {
    title: 'Language Selection',
    choose_language: 'Choose your language'
  },
  
  common: {
    continue: 'Continue',
    loading: 'Loading...'
  }
}

// Language codes supported by the backend
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
] as const

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']
