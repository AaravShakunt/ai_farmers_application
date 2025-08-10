// User Configuration and Default Settings
export const USER_CONFIG = {
  // Default User Profile
  defaultProfile: {
    name: 'Rajesh Kumar',
    farmerId: 'FK001234',
    initials: 'RK',
    location: 'Karnataka, India',
  },
  
  // Available Locations
  availableLocations: [
    'Karnataka, India',
    'Tamil Nadu, India', 
    'Andhra Pradesh, India',
    'Maharashtra, India',
    'Punjab, India',
    'Uttar Pradesh, India',
    'Madhya Pradesh, India',
    'Rajasthan, India',
    'Gujarat, India',
    'West Bengal, India',
  ],
  
  // Default Settings
  defaultSettings: {
    notifications: {
      weather: true,
      prices: true,
      schemes: false,
      reminders: true,
    },
    units: {
      temperature: 'celsius' as const,
      area: 'acres' as const,
      weight: 'kg' as const,
    },
    privacy: {
      analytics: true,
      crashReports: true,
      locationSharing: false,
    },
  },
  
  // Unit Options
  unitOptions: {
    temperature: [
      { value: 'celsius', label: 'Celsius (°C)' },
      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
    ],
    area: [
      { value: 'acres', label: 'Acres' },
      { value: 'hectares', label: 'Hectares' },
    ],
    weight: [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'pounds', label: 'Pounds (lbs)' },
    ],
  },
} as const
