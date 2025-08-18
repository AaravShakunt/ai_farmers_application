export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
}

export type ChatSession = {
  id: string
  title?: string
  messages: ChatMessage[]
  createdAt: number
  endedAt?: number
  summary?: string
}

export type MarketPrice = {
  crop: string
  price: number
  pricePerKg?: number
  unit?: string
  change?: number
  market?: string
  date?: string
}

export type MandiPrice = {
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

export type CropPriceDisplay = {
  name: string
  unit: string
  price: number
  change: number
  icon: string
  market?: string
  date?: string
}

export type WeatherData = {
  temperatureC: number
  humidityPct: number
  condition: string
  location?: {
    lat: number
    lon: number
  }
  // Extended weather data
  apparentTemperature?: number
  windSpeed?: number
  windDirection?: number
  pressure?: number
  precipitation?: number
  cloudCover?: number
  uvIndex?: number
  visibility?: number
  dewPoint?: number
  isDay?: boolean
  weatherCode?: number
  lastUpdated?: string
}

export type ImageCategory = 'leaf' | 'soil' | 'plant'

export type QueuedRequest = {
  id: string
  url: string
  method: 'GET' | 'POST'
  body?: unknown
  headers?: Record<string, string>
  createdAt: number
}
