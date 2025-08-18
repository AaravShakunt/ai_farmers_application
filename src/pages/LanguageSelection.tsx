import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../contexts/TranslationContext'
import type { SupportedLanguageCode } from '../config/translatable.config'

export default function LanguageSelection() {
  const { changeLanguage, supportedLanguages, t } = useTranslation()
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState<SupportedLanguageCode>('en')
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)


  const handleLanguageSelect = (langCode: SupportedLanguageCode) => {
    setSelectedLang(langCode)
    setIsSelected(true)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    if (!isTransitioning) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleContinue = async () => {
    setIsTransitioning(true)
    
    try {
      // Change language using the translation system
      await changeLanguage(selectedLang)
      
      // Mark language selection as completed and save selected language
      localStorage.setItem('language-selection-completed', 'true')
      localStorage.setItem('language-selected', 'true')
      localStorage.setItem('selected-language', selectedLang)
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Navigate to home
      navigate('/')
    } catch (error) {
      console.error('Language change failed:', error)
      setIsTransitioning(false)
    }
  }


  const selectedLanguage = supportedLanguages.find(lang => lang.code === selectedLang)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex flex-col items-center justify-center p-4 transition-all duration-500 ${
      isTransitioning ? 'blur-sm opacity-75' : ''
    }`}>
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
          title="Go Back"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20 transition-all duration-300 ${
        isTransitioning ? 'bg-gray-100/90 border-gray-300/20' : ''
      }`}>
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src="/Logo.png" 
            alt="AI Farmers Logo" 
            className="w-40 h-40 mx-auto object-contain drop-shadow-lg mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            AI Farmers Assistant
          </h1>
          <p className="text-sm italic text-gray-500 font-light leading-relaxed">
            "Smart farming solutions powered by AI"
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            {t('language.choose_language')}
          </label>
          <div className="relative" ref={dropdownRef}>
            {/* Custom Dropdown Button */}
            <button
              type="button"
              onClick={toggleDropdown}
              disabled={isTransitioning}
              className={`w-full p-3 border-2 rounded-xl transition-all duration-300 bg-white text-gray-800 font-medium cursor-pointer pr-10 text-center flex items-center justify-between
                ${isSelected && !isTransitioning 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300'
                }
                ${isTransitioning ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : ''}
                focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none
              `}
            >
              <span className="flex-1 text-center">
                {selectedLanguage?.nativeName} ({selectedLanguage?.name})
              </span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom Dropdown Menu - Scrollable with max 3 visible items */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-500 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="max-h-[144px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100">
                  {supportedLanguages.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleLanguageSelect(option.code)}
                      className={`w-full p-3 text-center hover:bg-green-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 min-h-[48px] flex items-center justify-center
                        ${selectedLang === option.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-800'}
                      `}
                    >
                      {option.nativeName} ({option.name})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isTransitioning}
          className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg transform
            ${isTransitioning 
              ? 'bg-gray-400 cursor-not-allowed opacity-75' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] text-white'
            }
          `}
        >
          {isTransitioning ? (
            <div className="flex items-center justify-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2"></div>
              {t('common.loading')}...
            </div>
          ) : (
            <span className="text-white">{t('common.continue')}</span>
          )}
        </button>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500/80">
          © 2024 AI Farmers Assistant. All rights reserved.
        </p>
      </div>
    </div>
  )
}
