import { getJson } from '../lib/request'

export interface ApiAlert {
  alert_id: string
  alert_type?: string
  severity: string
  title: string
  description: string
  start_time?: string
  end_time?: string
  affected_areas?: string[]
  recommendations?: string[]
  source?: string
  // Pest specific
  pest_name?: string
  crop_affected?: string[]
  symptoms?: string[]
  treatment?: string[]
  prevention?: string[]
  risk_level?: string
  season?: string
  temperature_range?: string
  humidity_range?: string
  // Disease specific
  disease_name?: string
  pathogen_type?: string
  environmental_conditions?: Record<string, string>
  // Climate specific
  climate_event?: string
  impact_on_crops?: string[]
  duration?: string
  preparation_time?: string
}

export interface AlertResponse {
  success: boolean
  data: {
    location: { lat: number; lon: number }
    alert_count: number
    alerts: ApiAlert[]
    generated_at: string
  }
  api_name: string
  timestamp: string
}

export interface AllAlertsResponse {
  success: boolean
  data: {
    location: { lat: number; lon: number }
    total_alert_count: number
    alert_breakdown: {
      weather: number
      pest: number
      disease: number
      climate: number
    }
    alerts: {
      weather_alerts: ApiAlert[]
      pest_alerts: ApiAlert[]
      disease_alerts: ApiAlert[]
      climate_alerts: ApiAlert[]
    }
    generated_at: string
  }
  api_name: string
  timestamp: string
}

// Convert API alert to our internal Alert format
export function convertApiAlert(apiAlert: ApiAlert, category: string = 'general'): {
  id: string
  type: 'urgent' | 'moderate' | 'healthy'
  message: string
  fullMessage: string
} {
  const severity = apiAlert.severity.toLowerCase()
  
  // Determine alert type based on severity
  let type: 'urgent' | 'moderate' | 'healthy'
  if (severity === 'high') {
    type = 'urgent'
  } else if (severity === 'medium') {
    type = 'moderate'
  } else {
    type = 'healthy'
  }

  // Create message from title
  const message = apiAlert.title

  // Create detailed message for modal
  let fullMessage = apiAlert.description

  // Add recommendations if available
  if (apiAlert.recommendations && apiAlert.recommendations.length > 0) {
    fullMessage += '\n\nRecommendations:\n' + apiAlert.recommendations.map(rec => `• ${rec}`).join('\n')
  }

  // Add symptoms for pest/disease alerts
  if (apiAlert.symptoms && apiAlert.symptoms.length > 0) {
    fullMessage += '\n\nSymptoms to watch for:\n' + apiAlert.symptoms.map(symptom => `• ${symptom}`).join('\n')
  }

  // Add treatment for pest/disease alerts
  if (apiAlert.treatment && apiAlert.treatment.length > 0) {
    fullMessage += '\n\nTreatment options:\n' + apiAlert.treatment.map(treatment => `• ${treatment}`).join('\n')
  }

  // Add affected areas if available
  if (apiAlert.affected_areas && apiAlert.affected_areas.length > 0) {
    fullMessage += '\n\nAffected areas: ' + apiAlert.affected_areas.join(', ')
  }

  // Add crop affected for pest/disease alerts
  if (apiAlert.crop_affected && apiAlert.crop_affected.length > 0) {
    fullMessage += '\n\nCrops affected: ' + apiAlert.crop_affected.join(', ')
  }

  return {
    id: apiAlert.alert_id,
    type,
    message,
    fullMessage
  }
}

export async function fetchAllAlerts(lat?: number, lon?: number, userId?: string): Promise<AllAlertsResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }

  return getJson<AllAlertsResponse>(`http://localhost:8000/alert/all?${params}`)
}

export async function fetchWeatherAlerts(lat?: number, lon?: number, userId?: string): Promise<AlertResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }

  return getJson<AlertResponse>(`http://localhost:8000/alert/weather?${params}`)
}

export async function fetchPestAlerts(lat?: number, lon?: number, userId?: string, season?: string): Promise<AlertResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }
  
  if (season) {
    params.append('season', season)
  }

  return getJson<AlertResponse>(`http://localhost:8000/alert/pest?${params}`)
}

export async function fetchDiseaseAlerts(lat?: number, lon?: number, userId?: string): Promise<AlertResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }

  return getJson<AlertResponse>(`http://localhost:8000/alert/disease?${params}`)
}

export async function fetchClimateAlerts(lat?: number, lon?: number, userId?: string): Promise<AlertResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }

  return getJson<AlertResponse>(`http://localhost:8000/alert/climate?${params}`)
}

export async function fetchAlertsBySeverity(
  severity: 'high' | 'medium' | 'low' | 'green',
  lat?: number,
  lon?: number,
  userId?: string
): Promise<AlertResponse> {
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('user_id', userId)
  } else if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString())
    params.append('lon', lon.toString())
  }

  return getJson<AlertResponse>(`http://localhost:8000/alert/severity/${severity}?${params}`)
}
