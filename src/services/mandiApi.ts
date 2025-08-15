const API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY || 'YOUR-API-KEY'
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

export interface MandiPrice {
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
}

export interface MandiApiResponse {
  records: MandiPrice[]
  total: number
  count: number
  limit: number
  offset: number
}

const MOCK_MANDI_PRICES: Record<string, MandiPrice> = {
  'Rice': {
    state: 'Punjab',
    district: 'Amritsar',
    market: 'Amritsar Mandi',
    commodity: 'Rice',
    variety: 'Common',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '2800',
    max_price: '3200',
    modal_price: '3000'
  },
  'Wheat': {
    state: 'Punjab',
    district: 'Ludhiana',
    market: 'Ludhiana Mandi',
    commodity: 'Wheat',
    variety: 'Common',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '2100',
    max_price: '2300',
    modal_price: '2200'
  },
  'Tomato': {
    state: 'Maharashtra',
    district: 'Pune',
    market: 'Pune Mandi',
    commodity: 'Tomato',
    variety: 'Local',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '1500',
    max_price: '2500',
    modal_price: '2000'
  },
  'Onion': {
    state: 'Maharashtra',
    district: 'Nashik',
    market: 'Nashik Mandi',
    commodity: 'Onion',
    variety: 'Local',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '1200',
    max_price: '1800',
    modal_price: '1500'
  },
  'Potato': {
    state: 'Uttar Pradesh',
    district: 'Agra',
    market: 'Agra Mandi',
    commodity: 'Potato',
    variety: 'Local',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '800',
    max_price: '1200',
    modal_price: '1000'
  },
  'Cotton': {
    state: 'Gujarat',
    district: 'Rajkot',
    market: 'Rajkot Mandi',
    commodity: 'Cotton',
    variety: 'Medium Staple',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '5500',
    max_price: '6200',
    modal_price: '5800'
  },
  'Sugarcane': {
    state: 'Uttar Pradesh',
    district: 'Muzaffarnagar',
    market: 'Muzaffarnagar Mandi',
    commodity: 'Sugarcane',
    variety: 'Common',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '320',
    max_price: '380',
    modal_price: '350'
  },
  'Maize': {
    state: 'Karnataka',
    district: 'Belgaum',
    market: 'Belgaum Mandi',
    commodity: 'Maize',
    variety: 'Yellow',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '1800',
    max_price: '2200',
    modal_price: '2000'
  },
  'Soybean': {
    state: 'Madhya Pradesh',
    district: 'Indore',
    market: 'Indore Mandi',
    commodity: 'Soybean',
    variety: 'Common',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '4200',
    max_price: '4800',
    modal_price: '4500'
  },
  'Groundnut': {
    state: 'Gujarat',
    district: 'Junagadh',
    market: 'Junagadh Mandi',
    commodity: 'Groundnut',
    variety: 'Bold',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '5800',
    max_price: '6500',
    modal_price: '6200'
  },
  'Chili': {
    state: 'Andhra Pradesh',
    district: 'Guntur',
    market: 'Guntur Mandi',
    commodity: 'Chili',
    variety: 'Dry Red',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '12000',
    max_price: '15000',
    modal_price: '13500'
  },
  'Turmeric': {
    state: 'Tamil Nadu',
    district: 'Erode',
    market: 'Erode Mandi',
    commodity: 'Turmeric',
    variety: 'Finger',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '8000',
    max_price: '9500',
    modal_price: '8800'
  },
  'Ginger': {
    state: 'Kerala',
    district: 'Wayanad',
    market: 'Wayanad Mandi',
    commodity: 'Ginger',
    variety: 'Dry',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '5500',
    max_price: '7000',
    modal_price: '6200'
  },
  'Garlic': {
    state: 'Madhya Pradesh',
    district: 'Mandsaur',
    market: 'Mandsaur Mandi',
    commodity: 'Garlic',
    variety: 'Common',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '8500',
    max_price: '11000',
    modal_price: '9800'
  },
  'Banana': {
    state: 'Tamil Nadu',
    district: 'Theni',
    market: 'Theni Mandi',
    commodity: 'Banana',
    variety: 'Robusta',
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: '1500',
    max_price: '2500',
    modal_price: '2000'
  }
}

export async function fetchMandiPrices(
  commodity?: string,
  state?: string,
  limit: number = 100,
  offset: number = 0
): Promise<MandiApiResponse> {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    format: 'json',
    limit: limit.toString(),
    offset: offset.toString()
  })

  if (commodity) {
    params.append('filters[commodity]', commodity)
  }
  
  if (state) {
    params.append('filters[state]', state)
  }

  const url = `${BASE_URL}?${params.toString()}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn('API not available, using mock data')
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.records || data.records.length === 0) {
      console.warn('No data from API, using mock data')
      throw new Error('No data available')
    }
    
    return data
  } catch (error) {
    console.error('Error fetching mandi prices, falling back to mock data:', error)
    
    const mockRecords = Object.values(MOCK_MANDI_PRICES)
    const filteredRecords = commodity 
      ? mockRecords.filter(record => record.commodity.toLowerCase().includes(commodity.toLowerCase()))
      : mockRecords
    
    return {
      records: filteredRecords,
      total: filteredRecords.length,
      count: filteredRecords.length,
      limit,
      offset
    }
  }
}

export async function getLatestPricesForCommodities(commodities: string[], useCache: boolean = true): Promise<MandiPrice[]> {
  // Try cache first if enabled
  if (useCache) {
    const { CacheManager } = await import('../lib/cache')
    const cachedData = CacheManager.loadPriceData(commodities)
    if (cachedData) {
      console.log('Using cached mandi price data')
      return cachedData
    }
  }

  console.log('Fetching fresh mandi price data')
  const allPrices: MandiPrice[] = []
  
  for (const commodity of commodities) {
    try {
      const response = await fetchMandiPrices(commodity, undefined, 10)
      if (response.records && response.records.length > 0) {
        const latestPrice = response.records.sort((a, b) => 
          new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
        )[0]
        allPrices.push(latestPrice)
      }
    } catch (error) {
      console.error(`Error fetching price for ${commodity}:`, error)
    }
  }
  
  // Cache the results if we have data
  if (allPrices.length > 0 && useCache) {
    const { CacheManager } = await import('../lib/cache')
    CacheManager.savePriceData(allPrices, commodities)
  }
  
  return allPrices
}

export function parsePrice(priceString: string): number {
  const cleanPrice = priceString.replace(/[^\d.]/g, '')
  return parseFloat(cleanPrice) || 0
}

export function getAveragePrice(mandiPrice: MandiPrice): number {
  const minPrice = parsePrice(mandiPrice.min_price)
  const maxPrice = parsePrice(mandiPrice.max_price)
  const modalPrice = parsePrice(mandiPrice.modal_price)
  
  if (modalPrice > 0) return modalPrice
  if (minPrice > 0 && maxPrice > 0) return (minPrice + maxPrice) / 2
  return minPrice || maxPrice || 0
}