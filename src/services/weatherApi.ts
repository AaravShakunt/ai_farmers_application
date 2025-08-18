import { getJson } from '../lib/request'

export interface WeatherData {
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

export interface DailyForecast {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationSum: number
  precipitationProbability: number
  windSpeedMax: number
  sunrise: string
  sunset: string
  uvIndexMax: number
}

export interface WeatherResponse {
  success: boolean
  data: any
  api_name: string
  timestamp: string
}

// Weather code to condition mapping
const WEATHER_CONDITIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
}

// Get user's current location
export async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to Hyderabad coordinates
      resolve({ lat: 17.3850, lon: 78.4867 })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        console.warn('Geolocation failed:', error)
        // Fallback to Hyderabad coordinates
        resolve({ lat: 17.3850, lon: 78.4867 })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Fetch current weather from backend
export async function fetchCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
  try {
    // Get location if not provided
    let location = { lat: lat || 17.3850, lon: lon || 78.4867 }
    if (!lat || !lon) {
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Using fallback location')
      }
    }

    const response = await getJson<WeatherResponse>(
      `http://localhost:8000/weather/current?lat=${location.lat}&lon=${location.lon}`
    )

    if (!response.success || !response.data.current) {
      throw new Error('Invalid weather response')
    }

    const current = response.data.current
    const weatherCode = current.weather_code || 0
    
    return {
      temperatureC: Math.round(current.temperature_2m || 25),
      humidityPct: Math.round(current.relative_humidity_2m || 60),
      condition: WEATHER_CONDITIONS[weatherCode] || 'Unknown',
      location,
      apparentTemperature: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      pressure: current.pressure_msl,
      precipitation: current.precipitation || 0,
      cloudCover: current.cloud_cover,
      dewPoint: current.dew_point_2m,
      isDay: current.is_day === 1,
      weatherCode,
      lastUpdated: response.timestamp
    }
  } catch (error) {
    console.error('Failed to fetch weather from backend:', error)
    
    // Return fallback weather data
    return {
      temperatureC: 28,
      humidityPct: 65,
      condition: 'Partly cloudy',
      location: { lat: lat || 17.3850, lon: lon || 78.4867 },
      lastUpdated: new Date().toISOString()
    }
  }
}

// Fetch daily forecast from backend
export async function fetchDailyForecast(lat?: number, lon?: number, days: number = 7): Promise<DailyForecast[]> {
  try {
    // Get location if not provided
    let location = { lat: lat || 17.3850, lon: lon || 78.4867 }
    if (!lat || !lon) {
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Using fallback location')
      }
    }

    const response = await getJson<WeatherResponse>(
      `http://localhost:8000/weather/daily?lat=${location.lat}&lon=${location.lon}&days=${days}`
    )

    if (!response.success || !response.data.daily) {
      throw new Error('Invalid forecast response')
    }

    const daily = response.data.daily
    const forecasts: DailyForecast[] = []

    for (let i = 0; i < (daily.time?.length || 0); i++) {
      forecasts.push({
        date: daily.time[i],
        weatherCode: daily.weather_code[i] || 0,
        tempMax: Math.round(daily.temperature_2m_max[i] || 30),
        tempMin: Math.round(daily.temperature_2m_min[i] || 20),
        precipitationSum: daily.precipitation_sum[i] || 0,
        precipitationProbability: daily.precipitation_probability_max[i] || 0,
        windSpeedMax: daily.wind_speed_10m_max[i] || 0,
        sunrise: daily.sunrise[i] || '',
        sunset: daily.sunset[i] || '',
        uvIndexMax: daily.uv_index_max[i] || 0
      })
    }

    return forecasts
  } catch (error) {
    console.error('Failed to fetch forecast from backend:', error)
    
    // Return fallback forecast data
    const fallbackForecasts: DailyForecast[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      fallbackForecasts.push({
        date: date.toISOString().split('T')[0],
        weatherCode: i % 2 === 0 ? 1 : 2,
        tempMax: 30 + (i % 3),
        tempMin: 22 + (i % 2),
        precipitationSum: i % 3 === 0 ? 5 : 0,
        precipitationProbability: i % 3 === 0 ? 30 : 10,
        windSpeedMax: 15 + (i % 5),
        sunrise: '06:00',
        sunset: '18:30',
        uvIndexMax: 8 + (i % 3)
      })
    }
    
    return fallbackForecasts
  }
}

// Fetch complete weather data (current + forecast + air quality)
export async function fetchCompleteWeather(lat?: number, lon?: number): Promise<{
  current: WeatherData
  forecast: DailyForecast[]
  airQuality?: any
}> {
  try {
    // Get location if not provided
    let location = { lat: lat || 17.3850, lon: lon || 78.4867 }
    if (!lat || !lon) {
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Using fallback location')
      }
    }

    const response = await getJson<WeatherResponse>(
      `http://localhost:8000/weather/complete?lat=${location.lat}&lon=${location.lon}&days=7`
    )

    if (!response.success || !response.data) {
      throw new Error('Invalid complete weather response')
    }

    const data = response.data
    
    // Parse current weather
    const current = data.current || {}
    const weatherCode = current.weather_code || 0
    
    const currentWeather: WeatherData = {
      temperatureC: Math.round(current.temperature_2m || 25),
      humidityPct: Math.round(current.relative_humidity_2m || 60),
      condition: WEATHER_CONDITIONS[weatherCode] || 'Unknown',
      location,
      apparentTemperature: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      pressure: current.pressure_msl,
      precipitation: current.precipitation || 0,
      cloudCover: current.cloud_cover,
      isDay: current.is_day === 1,
      weatherCode,
      lastUpdated: response.timestamp
    }

    // Parse daily forecast
    const daily = data.daily || {}
    const forecasts: DailyForecast[] = []

    for (let i = 0; i < (daily.time?.length || 0); i++) {
      forecasts.push({
        date: daily.time[i],
        weatherCode: daily.weather_code[i] || 0,
        tempMax: Math.round(daily.temperature_2m_max[i] || 30),
        tempMin: Math.round(daily.temperature_2m_min[i] || 20),
        precipitationSum: daily.precipitation_sum[i] || 0,
        precipitationProbability: daily.precipitation_probability_max[i] || 0,
        windSpeedMax: daily.wind_speed_10m_max[i] || 0,
        sunrise: daily.sunrise[i] || '',
        sunset: daily.sunset[i] || '',
        uvIndexMax: daily.uv_index_max[i] || 0
      })
    }

    return {
      current: currentWeather,
      forecast: forecasts,
      airQuality: data.air_quality
    }
  } catch (error) {
    console.error('Failed to fetch complete weather from backend:', error)
    
    // Return fallback data
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchDailyForecast(lat, lon)
    ])
    
    return { current, forecast }
  }
}

// Get weather condition emoji
export function getWeatherEmoji(weatherCode: number, isDay: boolean = true): string {
  const emojiMap: Record<number, { day: string; night: string }> = {
    0: { day: '☀️', night: '🌙' }, // Clear sky
    1: { day: '🌤️', night: '🌙' }, // Mainly clear
    2: { day: '⛅', night: '☁️' }, // Partly cloudy
    3: { day: '☁️', night: '☁️' }, // Overcast
    45: { day: '🌫️', night: '🌫️' }, // Fog
    48: { day: '🌫️', night: '🌫️' }, // Depositing rime fog
    51: { day: '🌦️', night: '🌦️' }, // Light drizzle
    53: { day: '🌦️', night: '🌦️' }, // Moderate drizzle
    55: { day: '🌧️', night: '🌧️' }, // Dense drizzle
    61: { day: '🌧️', night: '🌧️' }, // Slight rain
    63: { day: '🌧️', night: '🌧️' }, // Moderate rain
    65: { day: '🌧️', night: '🌧️' }, // Heavy rain
    71: { day: '🌨️', night: '🌨️' }, // Slight snow
    73: { day: '🌨️', night: '🌨️' }, // Moderate snow
    75: { day: '❄️', night: '❄️' }, // Heavy snow
    80: { day: '🌦️', night: '🌦️' }, // Slight rain showers
    81: { day: '🌧️', night: '🌧️' }, // Moderate rain showers
    82: { day: '⛈️', night: '⛈️' }, // Violent rain showers
    95: { day: '⛈️', night: '⛈️' }, // Thunderstorm
    96: { day: '⛈️', night: '⛈️' }, // Thunderstorm with hail
    99: { day: '⛈️', night: '⛈️' }  // Thunderstorm with heavy hail
  }

  const emoji = emojiMap[weatherCode]
  if (!emoji) return isDay ? '☀️' : '🌙'
  
  return isDay ? emoji.day : emoji.night
}

// Get weather condition description
export function getWeatherCondition(weatherCode: number): string {
  return WEATHER_CONDITIONS[weatherCode] || 'Unknown'
}
