import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Images from './pages/Images'
import Settings from './pages/Settings'
import { Header } from './components/ui/Header'
import { OnlineStatus } from './components/ui/OnlineStatus'
import { useEffect } from 'react'
import { initRequestQueue } from './lib/request'
import { BottomNav } from './components/ui/BottomNav'

export default function App() {
  useEffect(() => {
    initRequestQueue()
  }, [])
  const location = useLocation()
  const showBottomNav = location.pathname !== '/chat'
  return (
    <div className="min-h-full">
      <Header />
      <OnlineStatus />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/images" element={<Images />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {showBottomNav && (
        <div className="sm:hidden"><BottomNav /></div>
      )}
    </div>
  )
}
