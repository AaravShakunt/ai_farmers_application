import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMarketPrices, fetchWeather } from '../services/mockApi'
import type { MarketPrice, WeatherData } from '../types'
import { WeatherCard } from '../components/home/WeatherCard'
import { PricesCard } from '../components/home/PricesCard'
import { BottomNav } from '../components/ui/BottomNav'
import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n'

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

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
    <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      <div className="grid gap-4">
        <WeatherCard data={weather} loading={loading} />
        <PricesCard prices={prices} loading={loading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/chat"><Button full>{t('chatbot')}</Button></Link>
        <Link to="/images"><Button variant="secondary" full>{t('images')}</Button></Link>
      </div>

      <BottomNav />
    </div>
  )
}

