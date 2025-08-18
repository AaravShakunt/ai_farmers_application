import { getJson } from '../lib/request'

export interface BackendMarketPrice {
  crop_name: string
  market_name: string
  state: string
  district: string
  date: string
  prices_per_kg: {
    min: number
    modal: number
    max: number
  }
  prices_per_quintal: {
    min: number
    modal: number
    max: number
  }
  prices_per_ton: {
    min: number
    modal: number
    max: number
  }
  unit: string
  source: string
  last_updated: string
}

export interface MarketPriceResponse {
  success: boolean
  data: {
    summary: {
      crop_name: string
      total_markets: number
      price_range_per_kg: {
        min: number
        max: number
        average: number
      }
      price_range_per_quintal: {
        min: number
        max: number
        average: number
      }
      currency: string
      last_updated: string
    }
    market_prices: BackendMarketPrice[]
    filters_applied: {
      crop: string
      state?: string
      market?: string
      limit: number
    }
  }
  api_name: string
  timestamp: string
}

export interface SupportedCropsResponse {
  success: boolean
  data: {
    total_crops: number
    categories: string[]
    crops: Array<{
      name: string
      category: string
      aliases: string[]
    }>
    usage_note: string
  }
  api_name: string
  timestamp: string
}

// Convert backend market price to frontend MarketPrice format
export function convertBackendPrice(backendPrice: BackendMarketPrice): {
  crop: string
  pricePerKg: number
  unit: 'kg'
} {
  return {
    crop: backendPrice.crop_name,
    pricePerKg: backendPrice.prices_per_kg.modal,
    unit: 'kg'
  }
}

export async function fetchMarketPriceForCrop(cropName: string, limit: number = 5): Promise<MarketPriceResponse> {
  const params = new URLSearchParams({
    limit: limit.toString()
  })

  return getJson<MarketPriceResponse>(`http://localhost:8000/marketprice/${encodeURIComponent(cropName)}?${params}`)
}

export async function fetchMultipleCropPrices(crops: string[]): Promise<BackendMarketPrice[]> {
  try {
    // Use the new batch API for efficient single request
    const cropsParam = crops.join(',')
    const response = await getJson<{
      success: boolean
      data: {
        market_prices: Record<string, BackendMarketPrice>
      }
    }>(`http://localhost:8000/marketprice/batch?crops=${encodeURIComponent(cropsParam)}&limit=1`)
    
    if (response.success && response.data.market_prices) {
      // Convert the object values to array
      return Object.values(response.data.market_prices)
    }
    
    throw new Error('No data from batch API')
  } catch (error) {
    console.error('Failed to fetch batch prices, using fallback:', error)
    // Return fallback data for all crops
    return crops.map(crop => createFallbackPrice(crop))
  }
}

function createFallbackPrice(cropName: string): BackendMarketPrice {
  // Fallback prices for common crops
  const fallbackPrices: Record<string, number> = {
    'wheat': 22,
    'rice': 27,
    'maize': 20,
    'tomato': 12,
    'onion': 15,
    'potato': 10,
    'cotton': 55,
    'sugarcane': 3.2,
    'soybean': 40,
    'groundnut': 50
  }
  
  const pricePerKg = fallbackPrices[cropName.toLowerCase()] || 15
  
  return {
    crop_name: cropName,
    market_name: 'Local Market',
    state: 'India',
    district: 'Various',
    date: new Date().toISOString().split('T')[0],
    prices_per_kg: {
      min: pricePerKg * 0.9,
      modal: pricePerKg,
      max: pricePerKg * 1.1
    },
    prices_per_quintal: {
      min: pricePerKg * 90,
      modal: pricePerKg * 100,
      max: pricePerKg * 110
    },
    prices_per_ton: {
      min: pricePerKg * 900,
      modal: pricePerKg * 1000,
      max: pricePerKg * 1100
    },
    unit: 'INR',
    source: 'Fallback Data',
    last_updated: new Date().toISOString()
  }
}

export async function fetchSupportedCrops(): Promise<SupportedCropsResponse> {
  return getJson<SupportedCropsResponse>('http://localhost:8000/marketprice/crops/list')
}

// Get popular crops for the home page (limited to 3 most essential crops)
export async function fetchPopularCropPrices(): Promise<BackendMarketPrice[]> {
  const popularCrops = ['wheat', 'rice', 'tomato'] // Only 3 most essential crops
  
  try {
    return await fetchMultipleCropPrices(popularCrops)
  } catch (error) {
    console.error('Failed to fetch popular crop prices:', error)
    // Return fallback data
    return popularCrops.map(crop => createFallbackPrice(crop))
  }
}
