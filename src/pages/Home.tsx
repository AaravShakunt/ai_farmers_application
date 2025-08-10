import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMarketPrices, fetchWeather } from '../services/mockApi'
import type { MarketPrice, WeatherData } from '../types'
import { WeatherCard } from '../components/home/WeatherCard'
import { PricesCard } from '../components/home/PricesCard'
import { GovernmentSchemesCard } from '../components/home/GovernmentSchemesCard'
import { AlertBanner } from '../components/ui/AlertBanner'
import { BottomNav } from '../components/ui/BottomNav'
import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n'
import { APP_CONFIG, ALERTS_CONFIG } from '../config'

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredPrices = prices.filter(price => 
    price.crop.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      {/* Government Schemes - First Priority Section */}
      <div className="mb-4">
        <GovernmentSchemesCard />
      </div>

      {/* Weather Alert */}
      {weather && weather.temperatureC > APP_CONFIG.alerts.highTemperatureThreshold && (
        <div className="mb-3 bg-orange-50 border-l-4 border-orange-400 p-2 rounded-r-xl">
          <div className="flex items-center">
            <div className="text-orange-400 text-sm mr-2">⚠️</div>
            <div>
              <p className="text-xs font-medium text-orange-800">{ALERTS_CONFIG.weatherAlerts.highTemperature.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Weather Widget */}
      <div className="mb-4">
        <WeatherCard data={weather} loading={loading} />
      </div>

      {/* Market Prices Widget */}
      <div className="mb-4">
        <PricesCard prices={prices} loading={loading} />
      </div>

      {/* Financial Aid Banner */}
      <div className="mb-4">
        <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-xl">
          <div className="flex items-center justify-center">
            <div className="text-xl mr-2">💰</div>
            <div>
              <div className="text-sm font-medium">{t('financial_aid')}</div>
              <div className="text-xs opacity-90">{t('loans_subsidies')}</div>
            </div>
          </div>
        </button>
      </div>

      {/* Alert Banner - At Bottom */}
      <div className="mb-3">
        <AlertBanner alerts={ALERTS_CONFIG.defaultAlerts} />
      </div>

      <BottomNav />
      </div>
    </div>
  )
}
