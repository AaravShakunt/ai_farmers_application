import type { ChatMessage, ChatSession, MarketPrice, WeatherData, ImageCategory } from '../types'

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchWeather(): Promise<WeatherData> {
  await delay(300)
  return {
    temperatureC: 28,
    humidityPct: 62,
    condition: 'Partly cloudy',
  }
}

export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  await delay(400)
  return [
    { crop: 'Wheat', pricePerKg: 24.5, unit: 'kg' },
    { crop: 'Corn', pricePerKg: 18.2, unit: 'kg' },
    { crop: 'Rice', pricePerKg: 30.1, unit: 'kg' },
  ]
}

export async function createNewChat(): Promise<ChatSession> {
  await delay(200)
  return {
    id: String(Date.now()),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
  }
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatMessage> {
  await delay(600)
  const lastUser = messages.filter((m) => m.role === 'user').slice(-1)[0]
  return {
    id: String(Date.now()),
    role: 'assistant',
    content: `Here's some advice: ${lastUser?.content ?? 'How can I help you with your farm today?'}`,
    createdAt: Date.now(),
  }
}

export async function summarizeChat(messages: ChatMessage[]): Promise<{ summary: string; points: Array<{ label: string; value: number }> }> {
  await delay(1000)
  // Simple heuristic-based mock summary
  const userMsgs = messages.filter((m) => m.role === 'user').length
  const assistantMsgs = messages.filter((m) => m.role === 'assistant').length
  return {
    summary: 'Summary: Irrigation recommended in mornings; Monitor leaf spots; Consider local market rates for wheat vs rice this week.',
    points: [
      { label: 'Watering', value: 60 },
      { label: 'Pest', value: 25 },
      { label: 'Market', value: 15 },
    ].map((p) => ({ ...p, value: Math.round((p.value * (userMsgs + assistantMsgs + 1)) % 100) })),
  }
}

export async function analyzeImage(category: ImageCategory, file: File): Promise<{ result: string }> {
  await delay(800)
  const kb = Math.max(1, Math.round(file.size / 1024))
  const res =
    category === 'leaf'
      ? `Detected mild leaf spots; apply organic neem oil. (img ~${kb}KB)`
      : category === 'soil'
        ? `Soil appears dry; consider mulching and drip irrigation. (img ~${kb}KB)`
        : `Plant health is good; minor nutrient boost suggested. (img ~${kb}KB)`
  return { result: res }
}

