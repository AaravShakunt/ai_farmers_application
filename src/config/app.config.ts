// Application Configuration
export const APP_CONFIG = {
  // App Information
  name: 'Farmers.AI',
  tagline: 'Smart Farming Solutions',
  version: '1.0.0',
  build: '2024.08.10',
  
  // Contact Information
  developer: 'Farmers.AI Team',
  supportEmail: 'support@farmers.ai',
  helpline: '1800-180-1551',
  website: 'gov.in',
  
  // Theme Configuration
  theme: {
    defaultTheme: 'light' as const,
    enableSystemPreference: false,
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    timeout: 10000,
    retryAttempts: 3,
  },
  
  // Feature Flags
  features: {
    offlineMode: true,
    pushNotifications: true,
    analytics: true,
    crashReporting: true,
  },
  
  // UI Configuration
  ui: {
    maxItemsPerPage: 50,
    animationDuration: 300,
    toastDuration: 5000,
  },
  
  // Weather Alert Thresholds
  alerts: {
    highTemperatureThreshold: 35, // Celsius
    lowTemperatureThreshold: 5,   // Celsius
    highHumidityThreshold: 80,    // Percentage
    lowHumidityThreshold: 20,     // Percentage
  },
  
  // Copyright
  copyright: '© 2024 Farmers.AI. All rights reserved.',
} as const
