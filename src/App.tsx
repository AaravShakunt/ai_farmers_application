import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Images from './pages/Images'
import ImageModels from './pages/ImageModels'
import Settings from './pages/Settings'
import LanguageSelection from './pages/LanguageSelection'
import Tasks from './pages/Tasks'
import Workflow from './pages/Workflow'
import { Header } from './components/ui/Header'
import { OnlineStatus } from './components/ui/OnlineStatus'
import { useEffect } from 'react'
import { initRequestQueue } from './lib/request'
import { BottomNav } from './components/ui/BottomNav'
import { useI18n } from './i18n'

export default function App() {
  const { isLanguageSelected } = useI18n()
  
  useEffect(() => {
    initRequestQueue()
  }, [])
  
  const location = useLocation()
  const showBottomNav = location.pathname !== '/language-selection'

  // Show language selection if no language has been selected
  if (!isLanguageSelected) {
    return <LanguageSelection />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <OnlineStatus />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/images" element={<Images />} />
        <Route path="/image-models" element={<ImageModels />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/language-selection" element={<LanguageSelection />} />
      </Routes>
      {showBottomNav && (
        <div className="sm:hidden"><BottomNav /></div>
      )}
    </div>
  )
}
