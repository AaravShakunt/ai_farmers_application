import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { MarketPrice, WeatherData } from '../types'
import { fetchCurrentWeather } from '../services/weatherApi'
import { WeatherCard } from '../components/home/WeatherCard'
import { PricesCard } from '../components/home/PricesCard'
import { GovernmentSchemesCard } from '../components/home/GovernmentSchemesCard'
import { AlertBanner } from '../components/ui/AlertBanner'
import { BottomNav } from '../components/ui/BottomNav'
import { Button } from '../components/ui/Button'
import { APP_CONFIG, ALERTS_CONFIG } from '../config'
import { authStorage } from '../services/authApi'
import type { UserData } from '../services/authApi'
import { fetchAllAlerts, convertApiAlert, type ApiAlert } from '../services/alertApi'
import type { Alert } from '../config'
import { fetchPopularCropPrices, convertBackendPrice, type BackendMarketPrice } from '../services/marketPriceApi'
import { CacheManager } from '../lib/cache'

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

  // Get current user on component mount
  useEffect(() => {
    const user = authStorage.getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    let mounted = true
    
    const loadDataWithCache = async () => {
      try {
        const userLocation = currentUser?.location
        
        // 1. INSTANT LOAD FROM CACHE
        const cachedWeather = CacheManager.loadHomeWeather(userLocation)
        const cachedPrices = CacheManager.loadHomeMarketPrices()
        const cachedAlerts = CacheManager.loadHomeAlerts(currentUser?.id, userLocation)
        
        // Set cached data immediately for instant loading
        if (cachedWeather) {
          setWeather(cachedWeather)
        }
        if (cachedPrices) {
          setPrices(cachedPrices)
        }
        if (cachedAlerts) {
          setAlerts(cachedAlerts)
          setAlertsLoading(false)
        }
        
        // If we have all cached data, stop loading immediately
        if (cachedWeather && cachedPrices && cachedAlerts) {
          setLoading(false)
        }
        
        // 2. BACKGROUND UPDATE FROM API
        // Always fetch fresh data in background to update cache
        const [weatherData, marketPricesData] = await Promise.all([
          fetchCurrentWeather(userLocation?.latitude, userLocation?.longitude),
          fetchPopularCropPrices()
        ])
        
        if (!mounted) return
        
        // Update state with fresh data
        setWeather(weatherData)
        
        // Convert backend market prices to frontend format
        const convertedPrices: MarketPrice[] = marketPricesData.map(backendPrice => {
          const converted = convertBackendPrice(backendPrice)
          return {
            crop: converted.crop,
            price: converted.pricePerKg,
            pricePerKg: converted.pricePerKg,
            unit: converted.unit,
            change: 0, // Will be calculated later
            market: undefined,
            date: undefined
          }
        })
        setPrices(convertedPrices)
        
        // Cache the fresh data for next time
        CacheManager.saveHomeWeather(weatherData, userLocation)
        CacheManager.saveHomeMarketPrices(convertedPrices)
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to load data:', error)
        if (mounted) {
          // If we have cached data, keep using it even if API fails
          const cachedWeather = CacheManager.loadHomeWeather(currentUser?.location)
          const cachedPrices = CacheManager.loadHomeMarketPrices()
          
          if (!cachedWeather && !cachedPrices) {
            // Only show loading false if we have no cached data at all
            setLoading(false)
          }
        }
      }
    }
    
    loadDataWithCache()
    return () => { mounted = false }
  }, [currentUser])

  // Fetch alerts from API with caching
  useEffect(() => {
    let mounted = true
    
    const loadAlertsWithCache = async () => {
      try {
        const userLocation = currentUser?.location
        
        // 1. INSTANT LOAD FROM CACHE
        const cachedAlerts = CacheManager.loadHomeAlerts(currentUser?.id, userLocation)
        if (cachedAlerts) {
          setAlerts(cachedAlerts)
          setAlertsLoading(false)
        }
        
        // 2. BACKGROUND UPDATE FROM API
        const response = currentUser?.id 
          ? await fetchAllAlerts(undefined, undefined, currentUser.id)
          : await fetchAllAlerts(
              currentUser?.location?.latitude || 17.3850,
              currentUser?.location?.longitude || 78.4867
            )
        
        if (!mounted) return
        
        let freshAlerts: Alert[] = []
        
        if (response.success && response.data.alerts) {
          const { weather_alerts, pest_alerts, disease_alerts, climate_alerts } = response.data.alerts
          
          // Convert all types of alerts
          weather_alerts.forEach(alert => {
            freshAlerts.push(convertApiAlert(alert, 'weather'))
          })
          pest_alerts.forEach(alert => {
            freshAlerts.push(convertApiAlert(alert, 'pest'))
          })
          disease_alerts.forEach(alert => {
            freshAlerts.push(convertApiAlert(alert, 'disease'))
          })
          climate_alerts.forEach(alert => {
            freshAlerts.push(convertApiAlert(alert, 'climate'))
          })
        } else {
          // Fallback to default alerts if API fails
          freshAlerts = ALERTS_CONFIG.defaultAlerts
        }
        
        // Update state with fresh data
        setAlerts(freshAlerts)
        
        // Cache the fresh alerts
        CacheManager.saveHomeAlerts(freshAlerts, currentUser?.id, userLocation)
        
        setAlertsLoading(false)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        if (mounted) {
          // If we have cached alerts, keep using them
          const cachedAlerts = CacheManager.loadHomeAlerts(currentUser?.id, currentUser?.location)
          if (cachedAlerts) {
            setAlerts(cachedAlerts)
          } else {
            // Fallback to default alerts only if no cache
            setAlerts(ALERTS_CONFIG.defaultAlerts)
          }
          setAlertsLoading(false)
        }
      }
    }
    
    loadAlertsWithCache()
    return () => { mounted = false }
  }, [currentUser])

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
        <a 
          href="https://www.india.gov.in/topics/agriculture/schemes-farmers"
          className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center">
            <div className="text-xl mr-2">💰</div>
            <div>
              <div className="text-sm font-medium">Financial Aid</div>
              <div className="text-xs opacity-90">Loans & Subsidies</div>
            </div>
          </div>
        </a>
      </div>

      {/* Alert Banner - At Bottom */}
      {!alertsLoading && alerts.length > 0 && (
        <div className="mb-3">
          <AlertBanner alerts={alerts} />
        </div>
      )}

      <BottomNav />
      </div>
    </div>
  )
}
