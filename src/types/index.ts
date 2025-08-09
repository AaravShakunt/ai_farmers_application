export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
}

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  endedAt?: number
  summary?: string
}

export type MarketPrice = {
  crop: string
  pricePerKg: number
  unit: 'kg'
}

export type WeatherData = {
  temperatureC: number
  humidityPct: number
  condition: string
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

