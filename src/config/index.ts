// Configuration Index - Central export for all configurations
export { APP_CONFIG } from './app.config'
export { USER_CONFIG } from './user.config'
export { SCHEMES_CONFIG, type Scheme } from './schemes.config'
export { ALERTS_CONFIG, type Alert } from './alerts.config'
export { MOCK_DATA_CONFIG } from './mockData.config'
export { THEME_CONFIG, type Theme, type ThemeColors } from './theme.config'

// Re-export commonly used types
export type { MarketPrice, WeatherData, ChatMessage } from '../types'
