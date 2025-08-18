import { useState, useEffect } from 'react'
import { useI18n } from '../../i18n'
import type { WeatherData } from '../../types'
import { fetchCompleteWeather, getWeatherEmoji, getCurrentLocation, type DailyForecast } from '../../services/weatherApi'

interface WeatherCardProps {
  data: WeatherData | null
  loading: boolean
}

export function WeatherCard({ data, loading }: WeatherCardProps) {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completeWeatherData, setCompleteWeatherData] = useState<{
    current: WeatherData
    forecast: DailyForecast[]
    airQuality?: any
  } | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Load complete weather data when modal opens
  const loadCompleteWeatherData = async () => {
    if (completeWeatherData) return // Already loaded
    
    try {
      setDetailsLoading(true)
      console.log('🚀 WEATHER CARD: Loading complete weather data...')
      
      // Get user location or use current weather location
      const location = data?.location || await getCurrentLocation()
      
      const weatherData = await fetchCompleteWeather(location.lat, location.lon)
      setCompleteWeatherData(weatherData)
      
      console.log('✅ WEATHER CARD: Complete weather data loaded successfully')
      console.log(`📊 WEATHER CARD: ${weatherData.forecast.length} days forecast available`)
      
    } catch (error) {
      console.error('❌ WEATHER CARD: Complete weather data loading failed:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Use props data as primary source (comes from Home page API call)
  const weatherData = data

  const getWeatherIcon = (condition: string, weatherCode?: number, isDay?: boolean) => {
    // Use weather code if available for more accurate icons
    if (weatherCode !== undefined) {
      return getWeatherEmoji(weatherCode, isDay)
    }
    
    // Fallback to condition-based icons
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
      case 'clear sky':
        return '☀️'
      case 'partly cloudy':
      case 'partly_cloudy':
      case 'mainly clear':
        return '⛅'
      case 'cloudy':
      case 'overcast':
        return '☁️'
      case 'rainy':
      case 'rain':
      case 'slight rain':
      case 'moderate rain':
      case 'heavy rain':
        return '🌧️'
      case 'stormy':
      case 'thunderstorm':
        return '⛈️'
      case 'fog':
        return '🌫️'
      case 'snow':
      case 'snow fall':
        return '🌨️'
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

  // Helper functions for dynamic weather data
  const getAirQualityLevel = (aqi: number): string => {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  const calculateDayLength = (sunrise?: string, sunset?: string): string => {
    if (!sunrise || !sunset) return '12h 30m'
    try {
      const sunriseTime = new Date(`2000-01-01T${sunrise}`)
      const sunsetTime = new Date(`2000-01-01T${sunset}`)
      const diffMs = sunsetTime.getTime() - sunriseTime.getTime()
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    } catch {
      return '12h 30m'
    }
  }

  const generateWeatherAlerts = (current: any, forecast: any[]): Array<{type: string, message: string, severity: string}> => {
    const alerts = []
    
    if (current?.temperatureC > 35) {
      alerts.push({
        type: 'Heat Warning',
        message: `High temperature of ${current.temperatureC}°C may stress crops`,
        severity: 'high'
      })
    }
    
    if (current?.humidityPct > 80) {
      alerts.push({
        type: 'Disease Risk',
        message: 'High humidity increases fungal disease risk',
        severity: 'medium'
      })
    }
    
    if (current?.windSpeed > 25) {
      alerts.push({
        type: 'Wind Advisory',
        message: `Strong winds of ${Math.round(current.windSpeed)} km/h may damage crops`,
        severity: 'medium'
      })
    }
    
    if (current?.precipitation > 20) {
      alerts.push({
        type: 'Heavy Rain',
        message: `Heavy rainfall of ${current.precipitation}mm expected`,
        severity: 'high'
      })
    }
    
    return alerts
  }

  const getIrrigationNeed = (precipitation: number, humidity: number): string => {
    if (precipitation > 10) return 'Low'
    if (humidity > 70) return 'Moderate'
    if (humidity < 40) return 'High'
    return 'Moderate'
  }

  const getHeatStressLevel = (temperature: number): string => {
    if (temperature > 40) return 'Extreme'
    if (temperature > 35) return 'High'
    if (temperature > 30) return 'Moderate'
    return 'Low'
  }

  const getFrostRisk = (temperature: number): string => {
    if (temperature < 2) return 'High'
    if (temperature < 5) return 'Moderate'
    return 'None'
  }

  const getDiseaseRisk = (humidity: number, temperature: number): string => {
    if (humidity > 80 && temperature > 20 && temperature < 30) return 'High'
    if (humidity > 70) return 'Medium'
    return 'Low'
  }

  const getPestRisk = (temperature: number, windSpeed: number): string => {
    if (temperature > 25 && temperature < 35 && windSpeed < 15) return 'High'
    if (temperature > 20 && windSpeed < 20) return 'Medium'
    return 'Low'
  }

  const generateCropRecommendations = (current: any) => {
    const temp = current?.temperatureC || 25
    const humidity = current?.humidityPct || 60
    
    return {
      rice: {
        status: temp > 20 && temp < 35 ? 'Favorable' : 'Caution',
        action: humidity > 80 ? 'Monitor for blast disease' : 'Good growing conditions'
      },
      wheat: {
        status: temp > 15 && temp < 25 ? 'Excellent' : 'Moderate',
        action: temp > 30 ? 'Provide shade if possible' : 'Ideal conditions'
      },
      cotton: {
        status: temp > 25 && temp < 35 ? 'Excellent' : 'Moderate',
        action: 'Monitor for bollworm activity'
      },
      sugarcane: {
        status: temp > 20 ? 'Good' : 'Slow growth',
        action: humidity < 50 ? 'Increase irrigation' : 'Adequate moisture'
      },
      maize: {
        status: temp > 18 && temp < 32 ? 'Favorable' : 'Caution',
        action: 'Watch for pest activity in warm weather'
      }
    }
  }

  // Get dynamic weather data from API or fallback values
  const getDynamicWeatherData = () => {
    const current = completeWeatherData?.current || weatherData
    const forecast = completeWeatherData?.forecast || []
    const airQuality = completeWeatherData?.airQuality || {}
    
    return {
      // Basic Weather - from API
      windSpeed: current?.windSpeed || 0,
      windDirection: current?.windDirection ? `${Math.round(current.windDirection)}°` : 'N/A',
      pressure: current?.pressure || 1013,
      visibility: current?.visibility || 10,
      uvIndex: current?.uvIndex || 5,
      dewPoint: current?.dewPoint || 18,
      feelsLike: current?.apparentTemperature || current?.temperatureC || 25,
      precipitation: current?.precipitation || 0,
      cloudCover: current?.cloudCover || 50,
      
      // Air Quality - from API
      airQuality: getAirQualityLevel(airQuality.us_aqi || 50),
      aqi: Math.round(airQuality.us_aqi || 50),
      pm25: Math.round(airQuality.pm2_5 || 15),
      pm10: Math.round(airQuality.pm10 || 25),
      ozone: Math.round(airQuality.ozone || 65),
      co: Math.round((airQuality.carbon_monoxide || 300) / 1000 * 100) / 100,
      no2: Math.round(airQuality.nitrogen_dioxide || 20),
      so2: Math.round(airQuality.sulphur_dioxide || 10),
      
      // Time-based data - from API if available
      sunrise: forecast[0]?.sunrise || '06:15',
      sunset: forecast[0]?.sunset || '18:45',
      dayLength: calculateDayLength(forecast[0]?.sunrise, forecast[0]?.sunset),
      
      // Generate weather alerts based on real conditions
      weatherAlerts: generateWeatherAlerts(current, forecast),
      
      // Use real forecast data
      forecast: forecast.slice(0, 7),
      
      // Fallback values for agricultural data (would need specialized APIs)
      moonPhase: 'Waxing Crescent',
      soilMoisture: 65,
      soilTemp: Math.round((current?.temperatureC || 25) - 3),
      soilPh: 6.8,
      soilEc: 1.2,
      soilNitrogen: 45,
      soilPhosphorus: 38,
      soilPotassium: 52,
      rainfall24h: current?.precipitation || 0,
      evapotranspiration: 4.2,
      waterDeficit: -2.1,
      irrigationNeed: getIrrigationNeed(current?.precipitation || 0, current?.humidityPct || 60),
      growingDegreeDays: Math.max(0, (current?.temperatureC || 25) - 10),
      chillHours: 0,
      heatStress: getHeatStressLevel(current?.temperatureC || 25),
      frostRisk: getFrostRisk(current?.temperatureC || 25),
      diseaseRisk: getDiseaseRisk(current?.humidityPct || 60, current?.temperatureC || 25),
      pestRisk: getPestRisk(current?.temperatureC || 25, current?.windSpeed || 0),
      
      // Crop recommendations based on real conditions
      cropRecommendations: generateCropRecommendations(current)
    }
  }

  const dynamicWeatherData = getDynamicWeatherData()
  const uvInfo = getUvInfo(dynamicWeatherData.uvIndex)

  if (loading) {
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
              <div className="text-2xl mr-2">
                {getWeatherIcon(weatherData.condition, weatherData.weatherCode, weatherData.isDay)}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{weatherData.temperatureC}°C</div>
                <div className="text-xs text-gray-600 capitalize">{weatherData.condition}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-gray-600">
                💧 {weatherData.humidityPct}% • 💨 {Math.round(weatherData.windSpeed || 0)} km/h
              </div>
              <div className="text-gray-500">
                Feels like {Math.round(weatherData.apparentTemperature || weatherData.temperatureC)}°C
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <div className="text-center">
            <button 
              onClick={() => {
                setIsModalOpen(true)
                loadCompleteWeatherData()
              }}
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
              
              {/* Current Weather Cards */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🌤️ Current Weather</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Temperature Card */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌡️ Temperature</div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData.temperatureC}°C</div>
                    <div className="text-xs text-gray-600 capitalize">{weatherData.condition}</div>
                  </div>

                  {/* Feels Like Card */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🔥 Feels Like</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.apparentTemperature || weatherData.temperatureC)}°C</div>
                    <div className="text-xs text-gray-600">Apparent temp</div>
                  </div>

                  {/* Humidity Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">💧 Humidity</div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData.humidityPct}%</div>
                    <div className="text-xs text-gray-600">Relative humidity</div>
                  </div>

                  {/* Wind Speed Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">💨 Wind Speed</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.windSpeed || 0)}</div>
                    <div className="text-xs text-gray-600">km/h {weatherData.windDirection ? `${Math.round(weatherData.windDirection)}°` : ''}</div>
                  </div>

                  {/* Pressure Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌡️ Pressure</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.pressure || dynamicWeatherData.pressure)}</div>
                    <div className="text-xs text-gray-600">hPa</div>
                  </div>

                  {/* Precipitation Card */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌧️ Precipitation</div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData.precipitation || dynamicWeatherData.precipitation}</div>
                    <div className="text-xs text-gray-600">mm</div>
                  </div>

                </div>
              </div>

              {/* Environmental Data Cards */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🌍 Environmental Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* UV Index Card */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">☀️ UV Index</div>
                    <div className="text-2xl font-bold text-gray-800">{weatherData.uvIndex || dynamicWeatherData.uvIndex}</div>
                    <div className={`text-xs font-medium ${uvInfo.color}`}>{uvInfo.level}</div>
                  </div>

                  {/* Cloud Cover Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">☁️ Cloud Cover</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.cloudCover || dynamicWeatherData.cloudCover)}</div>
                    <div className="text-xs text-gray-600">%</div>
                  </div>

                  {/* Dew Point Card */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">💧 Dew Point</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.dewPoint || dynamicWeatherData.dewPoint)}</div>
                    <div className="text-xs text-gray-600">°C</div>
                  </div>

                  {/* Visibility Card */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">👁️ Visibility</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(weatherData.visibility || dynamicWeatherData.visibility)}</div>
                    <div className="text-xs text-gray-600">km</div>
                  </div>

                  {/* Air Quality Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌬️ Air Quality</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.aqi}</div>
                    <div className="text-xs text-green-600">{dynamicWeatherData.airQuality}</div>
                  </div>

                  {/* Weather Icon Card */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌤️ Condition</div>
                    <div className="text-4xl text-center mb-1">
                      {getWeatherIcon(weatherData.condition, weatherData.weatherCode, weatherData.isDay)}
                    </div>
                    <div className="text-xs text-gray-600 text-center capitalize">{weatherData.condition}</div>
                  </div>

                </div>
              </div>

              {/* Air Quality Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🏭 Air Quality Components</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* PM2.5 Card */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🔴 PM2.5</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.pm25}</div>
                    <div className="text-xs text-gray-600">μg/m³</div>
                  </div>

                  {/* PM10 Card */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🟠 PM10</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.pm10}</div>
                    <div className="text-xs text-gray-600">μg/m³</div>
                  </div>

                  {/* Ozone Card */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">� Ozone</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.ozone}</div>
                    <div className="text-xs text-gray-600">μg/m³</div>
                  </div>

                  {/* Carbon Monoxide Card */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">� CO</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.co}</div>
                    <div className="text-xs text-gray-600">mg/m³</div>
                  </div>

                  {/* Nitrogen Dioxide Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">� NO₂</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.no2}</div>
                    <div className="text-xs text-gray-600">μg/m³</div>
                  </div>

                  {/* Sulfur Dioxide Card */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">� SO₂</div>
                    <div className="text-2xl font-bold text-gray-800">{dynamicWeatherData.so2}</div>
                    <div className="text-xs text-gray-600">μg/m³</div>
                  </div>

                </div>
              </div>

              {/* Agricultural Conditions */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🌾 Agricultural Conditions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Irrigation Need Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">� Irrigation Need</div>
                    <div className="text-lg font-bold text-gray-800">{dynamicWeatherData.irrigationNeed}</div>
                    <div className="text-xs text-gray-600">Based on conditions</div>
                  </div>

                  {/* Heat Stress Card */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🌡️ Heat Stress</div>
                    <div className="text-lg font-bold text-gray-800">{dynamicWeatherData.heatStress}</div>
                    <div className="text-xs text-gray-600">Risk level</div>
                  </div>

                  {/* Disease Risk Card */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🦠 Disease Risk</div>
                    <div className="text-lg font-bold text-gray-800">{dynamicWeatherData.diseaseRisk}</div>
                    <div className="text-xs text-gray-600">Fungal diseases</div>
                  </div>

                  {/* Pest Risk Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">🐛 Pest Risk</div>
                    <div className="text-lg font-bold text-gray-800">{dynamicWeatherData.pestRisk}</div>
                    <div className="text-xs text-gray-600">Activity level</div>
                  </div>

                  {/* Growing Degree Days Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">📈 Growing Degree Days</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(dynamicWeatherData.growingDegreeDays)}</div>
                    <div className="text-xs text-gray-600">°C-days</div>
                  </div>

                  {/* Frost Risk Card */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">❄️ Frost Risk</div>
                    <div className="text-lg font-bold text-gray-800">{dynamicWeatherData.frostRisk}</div>
                    <div className="text-xs text-gray-600">Risk level</div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
