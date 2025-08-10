import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Language, useI18n } from '../i18n'

const LANGUAGE_OPTIONS: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
]

export default function LanguageSelection() {
  const { setLang, t } = useI18n()
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleLanguageSelect = (langCode: Language) => {
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
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 800))
    setLang(selectedLang)
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex flex-col items-center justify-center p-4 transition-all duration-500 ${
      isTransitioning ? 'blur-sm opacity-75' : ''
    }`}>
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
            AI Farmers
          </h1>
          <p className="text-sm italic text-gray-500 font-light leading-relaxed">
            "Empowering Agriculture with Intelligence"
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Please select your preferred language
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
                {LANGUAGE_OPTIONS.find(opt => opt.code === selectedLang)?.nativeName} ({LANGUAGE_OPTIONS.find(opt => opt.code === selectedLang)?.name})
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

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-500 rounded-xl shadow-lg z-50 overflow-hidden">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => handleLanguageSelect(option.code)}
                    className={`w-full p-3 text-center hover:bg-green-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0
                      ${selectedLang === option.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-800'}
                    `}
                  >
                    {option.nativeName} ({option.name})
                  </button>
                ))}
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
              Processing...
            </div>
          ) : (
            <span className="text-white">Continue</span>
          )}
        </button>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500/80">
          © 2025 AI Farmers. All rights reserved.
        </p>
      </div>
    </div>
  )
}
