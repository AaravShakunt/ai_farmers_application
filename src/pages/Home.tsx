import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMarketPrices, fetchWeather } from '../services/mockApi'
import type { MarketPrice, WeatherData } from '../types'
import { WeatherCard } from '../components/home/WeatherCard'
import { PricesCard } from '../components/home/PricesCard'

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchWeather(), fetchMarketPrices()]).then(([w, p]) => {
      if (!mounted) return
      setWeather(w)
      setPrices(p)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="container-app pb-8">
      <div className="mt-4 grid gap-4">
        <WeatherCard data={weather} loading={loading} />
        <PricesCard prices={prices} loading={loading} />
      </div>

      <div className="mt-6 grid-2">
        <Link to="/chat" className="btn text-center">Chatbot</Link>
        <Link to="/images" className="btn-secondary text-center">Image Models</Link>
      </div>
    </div>
  )
}

