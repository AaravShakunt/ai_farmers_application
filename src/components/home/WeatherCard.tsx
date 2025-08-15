import { useState, useEffect } from 'react'
import { useI18n } from '../../i18n'
import type { WeatherData } from '../../types'
import { fetchWeatherData, clearWeatherCache } from '../../services/weatherApi'

interface WeatherCardProps {
  data: WeatherData | null
  loading: boolean
}

export function WeatherCard({ data, loading }: WeatherCardProps) {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiWeatherData, setApiWeatherData] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(true)

  // Load weather data from API with detailed logging
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setApiLoading(true)
        console.log('🚀 WEATHER CARD: Starting weather data loading...')
        console.log('🌤️ WEATHER CARD: Using Open-Meteo API (free, no key required)')
        
        const weatherData = await fetchWeatherData()
        setApiWeatherData(weatherData)
        
        console.log('✅ WEATHER CARD: Weather data loaded successfully')
        console.log(`📊 WEATHER CARD: Current temp: ${weatherData.temperatureC}°C, Condition: ${weatherData.condition}`)
        console.log(`🌦️ WEATHER CARD: 7-day forecast available`)
        
      } catch (error) {
        console.error('❌ WEATHER CARD: Weather data loading failed:', error)
        console.warn('🟡 WEATHER CARD: Falling back to component props or default data')
      } finally {
        setApiLoading(false)
        console.log('✅ WEATHER CARD: Weather data loading completed')
      }
    }
    
    loadWeatherData()
  }, [])

  // Use API data if available, otherwise fallback to props data
  const weatherData = apiWeatherData || data

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return '☀️'
      case 'partly cloudy':
      case 'partly_cloudy':
        return '⛅'
      case 'cloudy':
        return '☁️'
      case 'rainy':
      case 'rain':
        return '🌧️'
      case 'stormy':
        return '⛈️'
      default:
        return '🌤️'
    }
  }

  const getUvInfo = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600' }
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600' }
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600' }
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-600' }
    return { level: 'Extreme', color: 'text-purple-600' }
  }

  // Comprehensive agricultural weather data
  const mockWeatherData = {
    // Basic Weather
    windSpeed: 12,
    windDirection: 'NE',
    windGust: 18,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    dewPoint: 18,
    feelsLike: data ? data.temperatureC + 2 : 25,
    sunrise: '06:15',
    sunset: '18:45',
    moonPhase: 'Waxing Crescent',
    dayLength: '12h 30m',
    
    // Air Quality & Environment
    airQuality: 'Good',
    aqi: 45,
    pm25: 12,
    pm10: 18,
    ozone: 65,
    co: 0.3,
    no2: 15,
    so2: 8,
    
    // Soil & Agricultural Data
    soilMoisture: 65,
    soilTemp: 22,
    soilPh: 6.8,
    soilEc: 1.2,
    soilNitrogen: 45,
    soilPhosphorus: 38,
    soilPotassium: 52,
    
    // Precipitation & Water
    rainfall24h: 2.5,
    rainfallWeek: 15.3,
    rainfallMonth: 45.7,
    evapotranspiration: 4.2,
    waterDeficit: -2.1,
    irrigationNeed: 'Moderate',
    
    // Growing Conditions
    growingDegreeDays: 18.5,
    chillHours: 0,
    heatStress: 'Low',
    frostRisk: 'None',
    diseaseRisk: 'Medium',
    pestRisk: 'Low',
    
    // Alerts & Recommendations
    weatherAlerts: [
      { type: 'Advisory', message: 'High humidity may increase fungal disease risk', severity: 'medium' },
      { type: 'Recommendation', message: 'Good conditions for spraying pesticides', severity: 'low' }
    ],
    
    // Extended Forecast
    forecast: [
      { day: 'Today', high: data?.temperatureC || 28, low: 18, condition: '☀️', rain: 10, humidity: 65, wind: 12 },
      { day: 'Tomorrow', high: 30, low: 20, condition: '⛅', rain: 20, humidity: 70, wind: 15 },
      { day: 'Thu', high: 26, low: 16, condition: '🌧️', rain: 80, humidity: 85, wind: 8 },
      { day: 'Fri', high: 24, low: 15, condition: '⛈️', rain: 90, humidity: 90, wind: 20 },
      { day: 'Sat', high: 27, low: 17, condition: '☀️', rain: 5, humidity: 60, wind: 10 },
      { day: 'Sun', high: 29, low: 19, condition: '☀️', rain: 0, humidity: 55, wind: 8 },
      { day: 'Mon', high: 31, low: 21, condition: '⛅', rain: 15, humidity: 68, wind: 12 },
    ],
    
    // Hourly Data (next 24 hours)
    hourlyForecast: [
      { time: '14:00', temp: 28, rain: 0, wind: 12, humidity: 65 },
      { time: '15:00', temp: 29, rain: 0, wind: 14, humidity: 62 },
      { time: '16:00', temp: 30, rain: 0, wind: 15, humidity: 60 },
      { time: '17:00', temp: 28, rain: 0, wind: 13, humidity: 65 },
      { time: '18:00', temp: 26, rain: 0, wind: 10, humidity: 70 },
      { time: '19:00', temp: 24, rain: 0, wind: 8, humidity: 75 },
      { time: '20:00', temp: 22, rain: 0, wind: 6, humidity: 80 },
      { time: '21:00', temp: 21, rain: 0, wind: 5, humidity: 82 },
    ],
    
    // Crop-Specific Recommendations
    cropRecommendations: {
      rice: { status: 'Favorable', action: 'Monitor for blast disease due to high humidity' },
      wheat: { status: 'Good', action: 'Ideal conditions for growth' },
      cotton: { status: 'Excellent', action: 'Perfect temperature range' },
      sugarcane: { status: 'Good', action: 'Adequate moisture levels' },
      maize: { status: 'Favorable', action: 'Watch for pest activity' }
    }
  }

  const uvInfo = getUvInfo(mockWeatherData.uvIndex)

  if (loading || apiLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{t('weather_forecast')}</h3>
          <div className="text-2xl">🌤️</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">28°C</div>
              <div className="text-sm text-gray-600">{t('partly_cloudy')}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{t('humidity')}: 65%</div>
              <div className="text-sm text-gray-600">{t('wind')}: 12 km/h</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-2">{t('next_3_days')}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-500">{t('tomorrow')}</div>
                <div className="text-lg">☀️</div>
                <div className="text-sm font-semibold text-gray-800">32°C</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">{t('day_after')}</div>
                <div className="text-lg">🌧️</div>
                <div className="text-sm font-semibold text-gray-800">26°C</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">{t('day_3')}</div>
                <div className="text-lg">⛅</div>
                <div className="text-sm font-semibold text-gray-800">29°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Clean Weather Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Clean Weather Card Content */}
        <div className="p-2">
          {/* Main Weather Display */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="text-2xl mr-2">{getWeatherIcon(weatherData.condition)}</div>
              <div>
                <div className="text-xl font-bold text-gray-800">{weatherData.temperatureC}°C</div>
                <div className="text-xs text-gray-600 capitalize">{weatherData.condition}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-gray-600">💧 {weatherData.humidityPct}% • 💨 {mockWeatherData.windSpeed} km/h</div>
              <div className="text-gray-500">Feels like {mockWeatherData.feelsLike}°C</div>
            </div>
          </div>

          {/* View Details Button */}
          <div className="text-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
            >
              View Detailed Report →
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Weather Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{t('weather')} - Detailed Report</h3>
                  <p className="text-sm opacity-90">{t('location')}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              
              {/* Weather Alerts */}
              {mockWeatherData.weatherAlerts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🚨 Weather Alerts & Recommendations</h4>
                  <div className="space-y-2">
                    {mockWeatherData.weatherAlerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                        alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-center">
                          <span className="font-semibold text-sm text-gray-800">{alert.type}:</span>
                          <span className="text-sm ml-2 text-gray-700">{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Conditions Overview */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">{getWeatherIcon(weatherData.condition)}</div>
                  <div className="text-4xl font-bold text-gray-800">{weatherData.temperatureC}°C</div>
                  <div className="text-sm text-gray-600 capitalize">{weatherData.condition}</div>
                  <div className="text-xs text-gray-500 mt-1">Feels like {mockWeatherData.feelsLike}°C</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">💧 Humidity</span>
                    <span className="font-semibold text-gray-800">{weatherData.humidityPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">💨 Wind</span>
                    <span className="font-semibold text-gray-800">{mockWeatherData.windSpeed} km/h {mockWeatherData.windDirection}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">🌪️ Gusts</span>
                    <span className="font-semibold text-gray-800">{mockWeatherData.windGust} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">🌡️ Pressure</span>
                    <span className="font-semibold text-gray-800">{mockWeatherData.pressure} hPa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">👁️ Visibility</span>
                    <span className="font-semibold text-gray-800">{mockWeatherData.visibility} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">💧 Dew Point</span>
                    <span className="font-semibold text-gray-800">{mockWeatherData.dewPoint}°C</span>
                  </div>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🌍 Environmental Conditions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600">☀️ UV Index</div>
                    <div className="text-lg font-bold text-gray-800">{mockWeatherData.uvIndex}</div>
                    <div className={`text-xs font-medium ${uvInfo.color}`}>{uvInfo.level}</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600">🌬️ Air Quality</div>
                    <div className="text-lg font-bold text-gray-800">AQI {mockWeatherData.aqi}</div>
                    <div className="text-xs text-green-600">{mockWeatherData.airQuality}</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600">🌅 Day Length</div>
                    <div className="text-lg font-bold text-gray-800">{mockWeatherData.dayLength}</div>
                    <div className="text-xs text-gray-600">🌙 {mockWeatherData.moonPhase}</div>
                  </div>
                </div>
              </div>

              {/* 7-Day Extended Forecast */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">📅 7-Day Extended Forecast</h4>
                <div className="grid grid-cols-7 gap-1">
                  {mockWeatherData.forecast.map((day, index) => (
                    <div key={index} className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 h-[120px] flex flex-col justify-between">
                      <div className="text-xs text-gray-600 h-4 flex items-center justify-center truncate">{day.day}</div>
                      <div className="text-2xl h-8 flex items-center justify-center">{day.condition}</div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="text-sm font-bold h-5 flex items-center justify-center text-gray-800">{day.high}°</div>
                        <div className="text-xs text-gray-500 h-4 flex items-center justify-center">{day.low}°</div>
                        <div className="text-xs text-blue-600 h-4 flex items-center justify-center">💧{day.rain}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
