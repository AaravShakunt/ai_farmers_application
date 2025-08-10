import type { ChatMessage, ChatSession, MarketPrice, WeatherData, ImageCategory } from '../types'
import { MOCK_DATA_CONFIG } from '../config'

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchWeather(): Promise<WeatherData> {
  await delay(MOCK_DATA_CONFIG.delays.weather)
  return MOCK_DATA_CONFIG.weather
}

export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  await delay(MOCK_DATA_CONFIG.delays.marketPrices)
  return MOCK_DATA_CONFIG.marketPrices
}

export async function createNewChat(): Promise<ChatSession> {
  await delay(MOCK_DATA_CONFIG.delays.newChat)
  return {
    id: String(Date.now()),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
  }
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatMessage> {
  await delay(MOCK_DATA_CONFIG.delays.chatMessage)
  const lastUser = messages.filter((m) => m.role === 'user').slice(-1)[0]
  
  // Smart response based on content
  let response: string = MOCK_DATA_CONFIG.chatResponses.default
  const userContent = lastUser?.content?.toLowerCase() || ''
  
  if (userContent.includes('water') || userContent.includes('irrigation')) {
    response = MOCK_DATA_CONFIG.chatResponses.irrigation
  } else if (userContent.includes('pest') || userContent.includes('insect')) {
    response = MOCK_DATA_CONFIG.chatResponses.pest
  } else if (userContent.includes('fertilizer') || userContent.includes('nutrient')) {
    response = MOCK_DATA_CONFIG.chatResponses.fertilizer
  } else if (userContent.includes('weather') || userContent.includes('rain')) {
    response = MOCK_DATA_CONFIG.chatResponses.weather
  } else if (userContent.includes('market') || userContent.includes('price')) {
    response = MOCK_DATA_CONFIG.chatResponses.market
  }
  
  return {
    id: String(Date.now()),
    role: 'assistant',
    content: response,
    createdAt: Date.now(),
  }
}

export async function summarizeChat(messages: ChatMessage[]): Promise<{ summary: string; points: Array<{ label: string; value: number }> }> {
  await delay(MOCK_DATA_CONFIG.delays.chatSummary)
  // Simple heuristic-based mock summary
  const userMsgs = messages.filter((m) => m.role === 'user').length
  const assistantMsgs = messages.filter((m) => m.role === 'assistant').length
  return {
    summary: 'Summary: Irrigation recommended in mornings; Monitor leaf spots; Consider local market rates for wheat vs rice this week.',
    points: MOCK_DATA_CONFIG.summaryCategories.map((p) => ({ 
      ...p, 
      label: p.label,
      value: Math.round((p.baseValue * (userMsgs + assistantMsgs + 1)) % 100) 
    })),
  }
}

export async function analyzeImage(category: ImageCategory, file: File): Promise<{ result: string }> {
  await delay(MOCK_DATA_CONFIG.delays.imageAnalysis)
  const kb = Math.max(1, Math.round(file.size / 1024))
  
  let baseResult: string = MOCK_DATA_CONFIG.imageAnalysis.plant
  if (category === 'leaf') {
    baseResult = MOCK_DATA_CONFIG.imageAnalysis.leaf
  } else if (category === 'soil') {
    baseResult = MOCK_DATA_CONFIG.imageAnalysis.soil
  }
  
  return { result: `${baseResult} (img ~${kb}KB)` }
}
