interface WeatherResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    precipitation_probability_max: number[]
  }
}

interface WeatherData {
  temperatureC: number
  condition: string
  humidityPct: number
  windSpeed: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    rain: number
  }>
}

const WEATHER_CACHE_KEY = 'weather_data'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Weather condition mapping from Open-Meteo codes
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'clear'
  if (code <= 3) return 'partly cloudy'
  if (code <= 48) return 'cloudy'
  if (code <= 67) return 'rainy'
  if (code <= 77) return 'snowy'
  if (code <= 82) return 'rainy'
  if (code <= 99) return 'stormy'
  return 'clear'
}

const formatDay = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export const fetchWeatherData = async (latitude: number = 28.6139, longitude: number = 77.2090): Promise<WeatherData> => {
  // Check cache first
  const cached = localStorage.getItem(WEATHER_CACHE_KEY)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    }
  }

  try {
    // Using Open-Meteo free weather API (no API key required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`
    )

    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data: WeatherResponse = await response.json()

    const weatherData: WeatherData = {
      temperatureC: Math.round(data.current.temperature_2m),
      condition: getWeatherCondition(data.current.weather_code),
      humidityPct: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      forecast: data.daily.time.slice(0, 7).map((day, index) => ({
        day: formatDay(day, index),
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        condition: getWeatherCondition(data.daily.weather_code[index]),
        rain: data.daily.precipitation_probability_max[index] || 0
      }))
    }

    // Cache the result
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      data: weatherData,
      timestamp: Date.now()
    }))

    return weatherData
  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // Return fallback data
    return {
      temperatureC: 28,
      condition: 'partly cloudy',
      humidityPct: 65,
      windSpeed: 12,
      forecast: [
        { day: 'Today', high: 28, low: 18, condition: 'sunny', rain: 10 },
        { day: 'Tomorrow', high: 30, low: 20, condition: 'partly cloudy', rain: 20 },
        { day: 'Thu', high: 26, low: 16, condition: 'rainy', rain: 80 },
        { day: 'Fri', high: 24, low: 15, condition: 'stormy', rain: 90 },
        { day: 'Sat', high: 27, low: 17, condition: 'sunny', rain: 5 },
        { day: 'Sun', high: 29, low: 19, condition: 'sunny', rain: 0 },
        { day: 'Mon', high: 31, low: 21, condition: 'partly cloudy', rain: 15 }
      ]
    }
  }
}

export const clearWeatherCache = (): void => {
  localStorage.removeItem(WEATHER_CACHE_KEY)
}