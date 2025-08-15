import type { CropPriceDisplay, MandiPrice } from '../types'

const CACHE_KEYS = {
  SELECTED_CROPS: 'mandi_selected_crops',
  PRICE_DATA: 'mandi_price_data',
  PREVIOUS_PRICES: 'mandi_previous_prices'
} as const

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

interface CachedPriceData {
  data: MandiPrice[]
  timestamp: number
  commodities: string[]
}

interface CachedCrops {
  crops: CropPriceDisplay[]
  timestamp: number
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

  getCacheInfo: () => {
    try {
      const priceCache = localStorage.getItem(CACHE_KEYS.PRICE_DATA)
      const selectedCropsCache = localStorage.getItem(CACHE_KEYS.SELECTED_CROPS)
      
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

      return {
        hasSelectedCrops: !!selectedCropsCache,
        priceCache: priceCacheInfo
      }
    } catch (error) {
      console.warn('Failed to get cache info:', error)
      return {
        hasSelectedCrops: false,
        priceCache: null
      }
    }
  }
}