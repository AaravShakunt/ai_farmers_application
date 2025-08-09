import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Images from './pages/Images'
import { Header } from './components/ui/Header'
import { OnlineStatus } from './components/ui/OnlineStatus'
import { useEffect } from 'react'
import { initRequestQueue } from './lib/request'

export default function App() {
  useEffect(() => {
    initRequestQueue()
  }, [])
  return (
    <div className="min-h-full">
      <Header />
      <OnlineStatus />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/images" element={<Images />} />
      </Routes>
    </div>
  )
}
