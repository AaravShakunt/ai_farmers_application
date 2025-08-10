// Mock Data Configuration
import type { MarketPrice, WeatherData, ChatMessage } from '../types'

export const MOCK_DATA_CONFIG = {
  // Weather Data
  weather: {
    temperatureC: 28,
    humidityPct: 62,
    condition: 'Partly cloudy',
  } as WeatherData,
  
  // Market Prices
  marketPrices: [
    { crop: 'Wheat', pricePerKg: 24.5, unit: 'kg' },
    { crop: 'Corn', pricePerKg: 18.2, unit: 'kg' },
    { crop: 'Rice', pricePerKg: 30.1, unit: 'kg' },
    { crop: 'Barley', pricePerKg: 22.8, unit: 'kg' },
    { crop: 'Soybean', pricePerKg: 45.3, unit: 'kg' },
    { crop: 'Cotton', pricePerKg: 52.7, unit: 'kg' },
    { crop: 'Sugarcane', pricePerKg: 3.2, unit: 'kg' },
    { crop: 'Potato', pricePerKg: 15.6, unit: 'kg' },
    { crop: 'Onion', pricePerKg: 28.9, unit: 'kg' },
    { crop: 'Tomato', pricePerKg: 35.4, unit: 'kg' },
  ] as MarketPrice[],
  
  // Chat Responses
  chatResponses: {
    default: 'Here\'s some advice based on your query. How can I help you with your farm today?',
    irrigation: 'For optimal irrigation, water your crops early morning or late evening to minimize evaporation. Consider drip irrigation for water efficiency.',
    pest: 'For pest control, use integrated pest management (IPM) techniques. Start with organic solutions like neem oil before considering chemical pesticides.',
    fertilizer: 'Apply fertilizers based on soil test results. Use organic compost when possible and follow the recommended NPK ratios for your specific crops.',
    weather: 'Monitor weather forecasts regularly. Protect crops during extreme weather and adjust irrigation schedules based on rainfall predictions.',
    market: 'Check market prices regularly and consider value-added processing. Store crops properly to sell when prices are favorable.',
  },
  
  // Image Analysis Results
  imageAnalysis: {
    leaf: 'Detected mild leaf spots; apply organic neem oil.',
    soil: 'Soil appears dry; consider mulching and drip irrigation.',
    plant: 'Plant health is good; minor nutrient boost suggested.',
    pest: 'Pest damage detected; recommend integrated pest management.',
    disease: 'Possible fungal infection; apply appropriate fungicide.',
  },
  
  // Chat Summary Points
  summaryCategories: [
    { label: 'Watering', baseValue: 60 },
    { label: 'Pest Control', baseValue: 25 },
    { label: 'Market Analysis', baseValue: 15 },
    { label: 'Fertilization', baseValue: 40 },
    { label: 'Disease Management', baseValue: 30 },
    { label: 'Crop Planning', baseValue: 35 },
  ],
  
  // API Delays (for realistic simulation)
  delays: {
    weather: 300,
    marketPrices: 400,
    chatMessage: 600,
    imageAnalysis: 800,
    chatSummary: 1000,
    newChat: 200,
  },
} as const
