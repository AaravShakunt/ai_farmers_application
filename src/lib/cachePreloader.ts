import { CacheManager } from './cache'
import { fetchCurrentWeather } from '../services/weatherApi'
import { fetchPopularCropPrices, convertBackendPrice } from '../services/marketPriceApi'
import { fetchAllAlerts, convertApiAlert } from '../services/alertApi'
import { ALERTS_CONFIG } from '../config'
import type { Alert } from '../config'
import type { MarketPrice } from '../types'

/**
 * Cache Preloader - Preloads home page data in the background
 * This ensures instant loading on subsequent visits
 */
export class CachePreloader {
  private static isPreloading = false

  /**
   * Preload all home page data in the background
   * This should be called when the app starts or when user navigates away from home
   */
  static async preloadHomeData(
    userLocation?: { latitude: number; longitude: number },
    userId?: string
  ): Promise<void> {
    // Prevent multiple simultaneous preloading
    if (this.isPreloading) return
    
    this.isPreloading = true
    
    try {
      // Check if we already have fresh cache
      const cacheInfo = CacheManager.getCacheInfo()
      const now = Date.now()
      const thirtyMinutes = 30 * 60 * 1000

      const needsWeatherUpdate = !cacheInfo.homeCache?.weather || 
        (cacheInfo.homeCache.weather.age * 60 * 1000) > thirtyMinutes

      const needsPricesUpdate = !cacheInfo.homeCache?.marketPrices || 
        (cacheInfo.homeCache.marketPrices.age * 60 * 1000) > thirtyMinutes

      const needsAlertsUpdate = !cacheInfo.homeCache?.alerts || 
        (cacheInfo.homeCache.alerts.age * 60 * 1000) > thirtyMinutes

      // Preload weather data if needed
      if (needsWeatherUpdate) {
        try {
          const weatherData = await fetchCurrentWeather(
            userLocation?.latitude, 
            userLocation?.longitude
          )
          CacheManager.saveHomeWeather(weatherData, userLocation)
        } catch (error) {
          console.warn('Failed to preload weather data:', error)
        }
      }

      // Preload market prices if needed
      if (needsPricesUpdate) {
        try {
          const marketPricesData = await fetchPopularCropPrices()
          const convertedPrices: MarketPrice[] = marketPricesData.map(backendPrice => {
            const converted = convertBackendPrice(backendPrice)
            return {
              crop: converted.crop,
              price: converted.pricePerKg,
              pricePerKg: converted.pricePerKg,
              unit: converted.unit,
              change: 0,
              market: undefined,
              date: undefined
            }
          })
          CacheManager.saveHomeMarketPrices(convertedPrices)
        } catch (error) {
          console.warn('Failed to preload market prices:', error)
        }
      }

      // Preload alerts if needed
      if (needsAlertsUpdate) {
        try {
          const response = userId 
            ? await fetchAllAlerts(undefined, undefined, userId)
            : await fetchAllAlerts(
                userLocation?.latitude || 17.3850,
                userLocation?.longitude || 78.4867
              )

          let alerts: Alert[] = []
          
          if (response.success && response.data.alerts) {
            const { weather_alerts, pest_alerts, disease_alerts, climate_alerts } = response.data.alerts
            
            weather_alerts.forEach(alert => {
              alerts.push(convertApiAlert(alert, 'weather'))
            })
            pest_alerts.forEach(alert => {
              alerts.push(convertApiAlert(alert, 'pest'))
            })
            disease_alerts.forEach(alert => {
              alerts.push(convertApiAlert(alert, 'disease'))
            })
            climate_alerts.forEach(alert => {
              alerts.push(convertApiAlert(alert, 'climate'))
            })
          } else {
            alerts = ALERTS_CONFIG.defaultAlerts
          }

          CacheManager.saveHomeAlerts(alerts, userId, userLocation)
        } catch (error) {
          console.warn('Failed to preload alerts:', error)
        }
      }

    } catch (error) {
      console.warn('Cache preloading failed:', error)
    } finally {
      this.isPreloading = false
    }
  }

  /**
   * Preload data when app becomes visible (user returns to app)
   */
  static setupVisibilityPreloader(
    userLocation?: { latitude: number; longitude: number },
    userId?: string
  ): () => void {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App became visible, preload fresh data
        this.preloadHomeData(userLocation, userId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  /**
   * Get cache status for debugging
   */
  static getCacheStatus() {
    return CacheManager.getCacheInfo()
  }

  /**
   * Clear all home page cache
   */
  static clearCache() {
    CacheManager.clearHomeCache()
  }
}
