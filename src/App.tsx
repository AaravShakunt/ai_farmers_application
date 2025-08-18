import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Images from './pages/Images'
import Settings from './pages/Settings'
import LanguageSelection from './pages/LanguageSelection'
import Login from './pages/Login'
import Farms from './pages/Farms'
import Workflow from './pages/Workflow'
import { Header } from './components/ui/Header'
import { OnlineStatus } from './components/ui/OnlineStatus'
import { useEffect, useState } from 'react'
import { initRequestQueue } from './lib/request'
import { BottomNav } from './components/ui/BottomNav'
import { TranslationProvider, TranslationLoader } from './contexts/TranslationContext'
import { CachePreloader } from './lib/cachePreloader'
import { authStorage } from './services/authApi'

export default function App() {
  const location = useLocation()
  
  // Function to reset translation state (for debugging)
  const resetTranslationState = () => {
    localStorage.removeItem('language-selection-completed')
    localStorage.removeItem('language-selected')
    localStorage.removeItem('selected-language')
    console.log('Translation state reset - refreshing page...')
    window.location.reload()
  }

  // Add global function for debugging (accessible from browser console)
  useEffect(() => {
    (window as any).resetTranslationState = resetTranslationState
    console.log('Debug: Use resetTranslationState() in console to reset translation state')
  }, [])
  
  useEffect(() => {
    initRequestQueue()
    
    // Debug: Log current localStorage values
    console.log('App initialization - localStorage values:')
    console.log('language-selection-completed:', localStorage.getItem('language-selection-completed'))
    console.log('language-selected:', localStorage.getItem('language-selected'))
    console.log('selected-language:', localStorage.getItem('selected-language'))
    console.log('Current route:', location.pathname)
    
    // Initialize cache preloader for home page data
    const currentUser = authStorage.getCurrentUser()
    const userLocation = currentUser?.location
    const userId = currentUser?.id
    
    // Setup visibility-based preloading (when user returns to app)
    const cleanupVisibilityPreloader = CachePreloader.setupVisibilityPreloader(userLocation, userId)
    
    // Preload data when navigating away from home page
    if (location.pathname !== '/home' && location.pathname !== '/' && location.pathname !== '/login') {
      // User is on other pages, preload home data in background
      CachePreloader.preloadHomeData(userLocation, userId)
    }
    
    return cleanupVisibilityPreloader
  }, [location.pathname])
  
  const showBottomNav = location.pathname !== '/language-selection' && location.pathname !== '/login' && location.pathname !== '/'

  return (
    <TranslationProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {location.pathname !== '/language-selection' && location.pathname !== '/login' && location.pathname !== '/' && <Header />}
        {location.pathname !== '/language-selection' && location.pathname !== '/login' && location.pathname !== '/' && <OnlineStatus />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tasks" element={<Farms />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/images" element={<Images />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/language-selection" element={<LanguageSelection />} />
        </Routes>
        {showBottomNav && (
          <div className="sm:hidden"><BottomNav /></div>
        )}
        <TranslationLoader />
      </div>
    </TranslationProvider>
  )
}
