import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../../i18n'
import { authStorage, authApi } from '../../services/authApi'
import type { UserData } from '../../services/authApi'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [notificationCount] = useState(3) // Mock notification count
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get current user on component mount
  useEffect(() => {
    const user = authStorage.getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3 md:px-6">
        
        {/* Left Side - Logo and App Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <img 
              src="/Logo.png" 
              alt="AI Farmers Logo" 
              className="w-10 h-10 object-cover rounded-full drop-shadow-md group-hover:scale-105 transition-transform duration-200 border-2 border-green-200"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
              {t('app_title')}
            </h1>
            <p className="text-xs text-gray-500 font-medium -mt-1">
              {t('smart_farming')}
            </p>
          </div>
        </Link>

        {/* Center - Navigation (Hidden on mobile) */}
        <nav className="hidden gap-6 text-sm sm:flex">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-green-100 text-green-700 font-semibold shadow-sm' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            {t('home')}
          </Link>
          <Link 
            to="/images" 
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname.startsWith('/images') 
                ? 'bg-green-100 text-green-700 font-semibold shadow-sm' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            {t('images')}
          </Link>
        </nav>

        {/* Right Side - Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Profile Dropdown */}
          <div className="relative flex items-center space-x-2">
            {/* User Info - Always visible on desktop */}
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-800">
                {currentUser ? currentUser.name : t('farmer_name')}
              </div>
              <div className="text-xs text-gray-500">
                {currentUser?.location?.address || t('location')}
              </div>
            </div>
            
            {/* Clickable Avatar */}
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
            >
              👨‍🌾
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div ref={dropdownRef} className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-30">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-800">
                    {currentUser ? currentUser.name : t('farmer_name')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.mobile || t('location')}
                  </div>
                </div>
                <Link 
                  to="/settings" 
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    selectedOption === 'settings' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                  onClick={() => {
                    setSelectedOption('settings')
                    setTimeout(() => {
                      setIsProfileOpen(false)
                      setSelectedOption(null)
                    }, 150)
                  }}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('settings')}
                </Link>
                <button 
                  className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${
                    selectedOption === 'logout' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                  onClick={() => {
                    setSelectedOption('logout')
                    setTimeout(() => {
                      authApi.logout()
                      setCurrentUser(null)
                      setIsProfileOpen(false)
                      setSelectedOption(null)
                      navigate('/login')
                    }, 150)
                  }}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
