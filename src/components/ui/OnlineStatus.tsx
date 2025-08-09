import { useEffect, useState } from 'react'

export function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1 text-xs text-white">
      Offline: requests will be queued
    </div>
  )
}

