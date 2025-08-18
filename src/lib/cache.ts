import type { CropPriceDisplay, MandiPrice, WeatherData, MarketPrice } from '../types'
import type { Alert } from '../config'

const CACHE_KEYS = {
  SELECTED_CROPS: 'mandi_selected_crops',
  PRICE_DATA: 'mandi_price_data',
  PREVIOUS_PRICES: 'mandi_previous_prices',
  WORKFLOW_CACHE: 'workflow_cache',
  HOME_WEATHER: 'home_weather_data',
  HOME_MARKET_PRICES: 'home_market_prices',
  HOME_ALERTS: 'home_alerts_data',
  FARMS_DATA: 'farms_data'
} as const

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const HOME_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes for home page data

interface CachedPriceData {
  data: MandiPrice[]
  timestamp: number
  commodities: string[]
}

interface CachedCrops {
  crops: CropPriceDisplay[]
  timestamp: number
}

interface WorkflowTask {
  id: string
  title: string
  estimated_time: string
  completed: boolean
}

interface CachedWorkflow {
  tasks: WorkflowTask[]
  plotId: string
  chatId: string
  timestamp: number
  generated_from_chat: boolean
  lastUpdated: number
}

export const CacheManager = {
  // Selected crops caching
  saveSelectedCrops: (crops: CropPriceDisplay[]): void => {
    try {
      const cachedData: CachedCrops = {
        crops,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.SELECTED_CROPS, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save selected crops to cache:', error)
    }
  },

  loadSelectedCrops: (): CropPriceDisplay[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.SELECTED_CROPS)
      if (!cached) return null

      const cachedData: CachedCrops = JSON.parse(cached)
      
      // Return cached crops (no expiration for user preferences)
      return cachedData.crops
    } catch (error) {
      console.warn('Failed to load selected crops from cache:', error)
      return null
    }
  },

  // Price data caching
  savePriceData: (data: MandiPrice[], commodities: string[]): void => {
    try {
      const cachedData: CachedPriceData = {
        data,
        timestamp: Date.now(),
        commodities: commodities.sort()
      }
      localStorage.setItem(CACHE_KEYS.PRICE_DATA, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save price data to cache:', error)
    }
  },

  loadPriceData: (commodities: string[]): MandiPrice[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PRICE_DATA)
      if (!cached) return null

      const cachedData: CachedPriceData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - cachedData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.PRICE_DATA)
        return null
      }

      // Check if commodities match
      const sortedCommodities = commodities.sort()
      if (JSON.stringify(cachedData.commodities) !== JSON.stringify(sortedCommodities)) {
        return null
      }

      return cachedData.data
    } catch (error) {
      console.warn('Failed to load price data from cache:', error)
      return null
    }
  },

  // Previous prices caching
  savePreviousPrices: (prices: Record<string, number>): void => {
    try {
      localStorage.setItem(CACHE_KEYS.PREVIOUS_PRICES, JSON.stringify(prices))
    } catch (error) {
      console.warn('Failed to save previous prices to cache:', error)
    }
  },

  loadPreviousPrices: (): Record<string, number> => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.PREVIOUS_PRICES)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.warn('Failed to load previous prices from cache:', error)
      return {}
    }
  },

  // Cache management
  clearPriceCache: (): void => {
    try {
      localStorage.removeItem(CACHE_KEYS.PRICE_DATA)
    } catch (error) {
      console.warn('Failed to clear price cache:', error)
    }
  },

  clearAllCache: (): void => {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('Failed to clear all cache:', error)
    }
  },

  // Workflow caching
  saveWorkflow: (tasks: WorkflowTask[], plotId: string, chatId: string, generated_from_chat: boolean): void => {
    try {
      const cachedWorkflow: CachedWorkflow = {
        tasks,
        plotId,
        chatId,
        timestamp: Date.now(),
        generated_from_chat,
        lastUpdated: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.WORKFLOW_CACHE, JSON.stringify(cachedWorkflow))
    } catch (error) {
      console.warn('Failed to save workflow to cache:', error)
    }
  },

  // Update workflow tasks (for completion status changes)
  updateWorkflowTasks: (tasks: WorkflowTask[], plotId: string): void => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.WORKFLOW_CACHE)
      if (!cached) return

      const cachedWorkflow: CachedWorkflow = JSON.parse(cached)
      
      // Only update if it's for the same plot
      if (cachedWorkflow.plotId === plotId) {
        cachedWorkflow.tasks = tasks
        cachedWorkflow.lastUpdated = Date.now()
        localStorage.setItem(CACHE_KEYS.WORKFLOW_CACHE, JSON.stringify(cachedWorkflow))
      }
    } catch (error) {
      console.warn('Failed to update workflow tasks in cache:', error)
    }
  },

  loadWorkflow: (plotId: string, chatId?: string): CachedWorkflow | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.WORKFLOW_CACHE)
      if (!cached) return null

      const cachedWorkflow: CachedWorkflow = JSON.parse(cached)
      
      // Check if this matches the current plot and chat session
      if (cachedWorkflow.plotId === plotId && (!chatId || cachedWorkflow.chatId === chatId)) {
        return cachedWorkflow
      }

      return null
    } catch (error) {
      console.warn('Failed to load workflow from cache:', error)
      return null
    }
  },

  clearWorkflowCache: (): void => {
    try {
      localStorage.removeItem(CACHE_KEYS.WORKFLOW_CACHE)
    } catch (error) {
      console.warn('Failed to clear workflow cache:', error)
    }
  },

  // Home page weather caching
  saveHomeWeather: (weather: WeatherData, userLocation?: { latitude: number; longitude: number }): void => {
    try {
      const cachedData = {
        weather,
        timestamp: Date.now(),
        userLocation
      }
      localStorage.setItem(CACHE_KEYS.HOME_WEATHER, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save home weather to cache:', error)
    }
  },

  loadHomeWeather: (userLocation?: { latitude: number; longitude: number }): WeatherData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.HOME_WEATHER)
      if (!cached) return null

      const cachedData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - cachedData.timestamp > HOME_CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.HOME_WEATHER)
        return null
      }

      // Check if location matches (if provided)
      if (userLocation && cachedData.userLocation) {
        const latDiff = Math.abs(userLocation.latitude - cachedData.userLocation.latitude)
        const lonDiff = Math.abs(userLocation.longitude - cachedData.userLocation.longitude)
        // If location changed significantly (more than 0.1 degrees), invalidate cache
        if (latDiff > 0.1 || lonDiff > 0.1) {
          localStorage.removeItem(CACHE_KEYS.HOME_WEATHER)
          return null
        }
      }

      return cachedData.weather
    } catch (error) {
      console.warn('Failed to load home weather from cache:', error)
      return null
    }
  },

  // Home page market prices caching
  saveHomeMarketPrices: (prices: MarketPrice[]): void => {
    try {
      const cachedData = {
        prices,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEYS.HOME_MARKET_PRICES, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save home market prices to cache:', error)
    }
  },

  loadHomeMarketPrices: (): MarketPrice[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.HOME_MARKET_PRICES)
      if (!cached) return null

      const cachedData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - cachedData.timestamp > HOME_CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.HOME_MARKET_PRICES)
        return null
      }

      return cachedData.prices
    } catch (error) {
      console.warn('Failed to load home market prices from cache:', error)
      return null
    }
  },

  // Home page alerts caching
  saveHomeAlerts: (alerts: Alert[], userId?: string, userLocation?: { latitude: number; longitude: number }): void => {
    try {
      const cachedData = {
        alerts,
        timestamp: Date.now(),
        userId,
        userLocation
      }
      localStorage.setItem(CACHE_KEYS.HOME_ALERTS, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save home alerts to cache:', error)
    }
  },

  loadHomeAlerts: (userId?: string, userLocation?: { latitude: number; longitude: number }): Alert[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.HOME_ALERTS)
      if (!cached) return null

      const cachedData = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - cachedData.timestamp > HOME_CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEYS.HOME_ALERTS)
        return null
      }

      // Check if user or location matches
      if (userId && cachedData.userId && userId !== cachedData.userId) {
        return null
      }

      if (userLocation && cachedData.userLocation) {
        const latDiff = Math.abs(userLocation.latitude - cachedData.userLocation.latitude)
        const lonDiff = Math.abs(userLocation.longitude - cachedData.userLocation.longitude)
        // If location changed significantly, invalidate cache
        if (latDiff > 0.1 || lonDiff > 0.1) {
          localStorage.removeItem(CACHE_KEYS.HOME_ALERTS)
          return null
        }
      }

      return cachedData.alerts
    } catch (error) {
      console.warn('Failed to load home alerts from cache:', error)
      return null
    }
  },

  // Farms data caching
  saveFarmsData: (farms: any[], userMobile: string): void => {
    try {
      const cachedData = {
        farms,
        timestamp: Date.now(),
        userMobile
      }
      localStorage.setItem(CACHE_KEYS.FARMS_DATA, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save farms data to cache:', error)
    }
  },

  loadFarmsData: (userMobile: string): any[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.FARMS_DATA)
      if (!cached) return null

      const cachedData = JSON.parse(cached)
      
      // Check if cache is expired (5 minutes for farms data)
      if (Date.now() - cachedData.timestamp > (5 * 60 * 1000)) {
        localStorage.removeItem(CACHE_KEYS.FARMS_DATA)
        return null
      }

      // Check if user matches
      if (cachedData.userMobile !== userMobile) {
        return null
      }

      return cachedData.farms
    } catch (error) {
      console.warn('Failed to load farms data from cache:', error)
      return null
    }
  },

  // Clear home page cache
  clearHomeCache: (): void => {
    try {
      localStorage.removeItem(CACHE_KEYS.HOME_WEATHER)
      localStorage.removeItem(CACHE_KEYS.HOME_MARKET_PRICES)
      localStorage.removeItem(CACHE_KEYS.HOME_ALERTS)
    } catch (error) {
      console.warn('Failed to clear home cache:', error)
    }
  },

  // Clear farms cache
  clearFarmsCache: (): void => {
    try {
      localStorage.removeItem(CACHE_KEYS.FARMS_DATA)
    } catch (error) {
      console.warn('Failed to clear farms cache:', error)
    }
  },

  getCacheInfo: () => {
    try {
      const priceCache = localStorage.getItem(CACHE_KEYS.PRICE_DATA)
      const selectedCropsCache = localStorage.getItem(CACHE_KEYS.SELECTED_CROPS)
      const workflowCache = localStorage.getItem(CACHE_KEYS.WORKFLOW_CACHE)
      const homeWeatherCache = localStorage.getItem(CACHE_KEYS.HOME_WEATHER)
      const homeMarketPricesCache = localStorage.getItem(CACHE_KEYS.HOME_MARKET_PRICES)
      const homeAlertsCache = localStorage.getItem(CACHE_KEYS.HOME_ALERTS)
      
      let priceCacheInfo = null
      if (priceCache) {
        const data: CachedPriceData = JSON.parse(priceCache)
        const ageMinutes = Math.floor((Date.now() - data.timestamp) / (1000 * 60))
        priceCacheInfo = {
          age: ageMinutes,
          commodities: data.commodities,
          isExpired: ageMinutes > 10
        }
      }

      let workflowCacheInfo = null
      if (workflowCache) {
        const data: CachedWorkflow = JSON.parse(workflowCache)
        const ageMinutes = Math.floor((Date.now() - data.timestamp) / (1000 * 60))
        const lastUpdatedMinutes = Math.floor((Date.now() - data.lastUpdated) / (1000 * 60))
        workflowCacheInfo = {
          age: ageMinutes,
          lastUpdated: lastUpdatedMinutes,
          plotId: data.plotId,
          chatId: data.chatId,
          taskCount: data.tasks.length,
          completedTasks: data.tasks.filter(t => t.completed).length,
          generated_from_chat: data.generated_from_chat
        }
      }

      let homeCacheInfo = {
        weather: null as any,
        marketPrices: null as any,
        alerts: null as any
      }

      if (homeWeatherCache) {
        const data = JSON.parse(homeWeatherCache)
        const ageMinutes = Math.floor((Date.now() - data.timestamp) / (1000 * 60))
        homeCacheInfo.weather = {
          age: ageMinutes,
          isExpired: ageMinutes > 30
        }
      }

      if (homeMarketPricesCache) {
        const data = JSON.parse(homeMarketPricesCache)
        const ageMinutes = Math.floor((Date.now() - data.timestamp) / (1000 * 60))
        homeCacheInfo.marketPrices = {
          age: ageMinutes,
          isExpired: ageMinutes > 30
        }
      }

      if (homeAlertsCache) {
        const data = JSON.parse(homeAlertsCache)
        const ageMinutes = Math.floor((Date.now() - data.timestamp) / (1000 * 60))
        homeCacheInfo.alerts = {
          age: ageMinutes,
          isExpired: ageMinutes > 30
        }
      }

      return {
        hasSelectedCrops: !!selectedCropsCache,
        priceCache: priceCacheInfo,
        workflowCache: workflowCacheInfo,
        homeCache: homeCacheInfo
      }
    } catch (error) {
      console.warn('Failed to get cache info:', error)
      return {
        hasSelectedCrops: false,
        priceCache: null,
        workflowCache: null,
        homeCache: null
      }
    }
  }
}
