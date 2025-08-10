// Alerts and Notifications Configuration
export interface Alert {
  id: string
  type: 'urgent' | 'moderate' | 'healthy'
  message: string
  fullMessage: string
}

export const ALERTS_CONFIG = {
  // Default Alerts
  defaultAlerts: [
    {
      id: '1',
      type: 'urgent',
      message: 'Crop Insurance Registration Open',
      fullMessage: 'The deadline for Crop Insurance Scheme registration is approaching fast. You must complete your registration before 15th October to ensure your crops are covered for the upcoming season. Visit your nearest agriculture office or apply online through the government portal. Required documents: Land records, Aadhaar card, and bank details.'
    },
    {
      id: '2', 
      type: 'moderate',
      message: 'High humidity - Monitor crops',
      fullMessage: 'Current weather conditions show high humidity levels which may increase the risk of fungal diseases in your crops. Monitor your fields closely and consider applying preventive fungicide treatments. Ensure proper drainage and avoid over-watering during this period.'
    },
    {
      id: '3',
      type: 'healthy',
      message: 'All systems healthy',
      fullMessage: 'Current conditions are optimal for farming activities. Weather is favorable, market prices are stable, and no urgent actions are required. Continue with your regular farming schedule and monitor updates for any changes.'
    }
  ] as Alert[],
  
  // Alert Type Configuration
  alertTypes: {
    urgent: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      icon: '🚨',
      priority: 1
    },
    moderate: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-400',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-400',
      icon: '⚠️',
      priority: 2
    },
    healthy: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
      icon: '✅',
      priority: 3
    }
  },
  
  // Weather Alert Messages
  weatherAlerts: {
    highTemperature: {
      title: 'High Temperature Alert',
      message: 'Temperature above 35°C detected',
      recommendation: 'Ensure adequate irrigation and consider shade nets for sensitive crops'
    },
    lowTemperature: {
      title: 'Low Temperature Alert',
      message: 'Temperature below 5°C detected',
      recommendation: 'Protect crops from frost damage and consider covering sensitive plants'
    },
    highHumidity: {
      title: 'High Humidity Alert',
      message: 'Humidity above 80% detected',
      recommendation: 'Monitor for fungal diseases and ensure proper ventilation'
    },
    lowHumidity: {
      title: 'Low Humidity Alert',
      message: 'Humidity below 20% detected',
      recommendation: 'Increase irrigation frequency and consider mulching'
    }
  }
} as const
