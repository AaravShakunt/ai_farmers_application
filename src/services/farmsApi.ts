import { smartFetch } from '../lib/offlineQueue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface Farm {
  id: string
  name: string
  location: string
  area: number
  crop: string
  soilType: string
  irrigationType: string
  plantingDate: string
  expectedHarvest: string
  lastChatDate?: string
  hasWorkflow: boolean
  status: 'Active' | 'Planning' | 'Harvested'
  created_at?: string
  updated_at?: string
}

export interface FarmImage {
  id: string
  category: 'leaf' | 'soil' | 'insects'
  name: string
  filename: string
  timestamp: string
  url: string
  chatSessionId: string
}

export interface CreateFarmRequest {
  name: string
  location: string
  area: number
  crop: string
  soilType: string
  irrigationType: string
  plantingDate: string
  expectedHarvest: string
  status?: 'Active' | 'Planning' | 'Harvested'
  hasWorkflow?: boolean
}

export interface UpdateFarmRequest extends CreateFarmRequest {
  lastChatDate?: string
}

export interface FarmsResponse {
  success: boolean
  farms: Farm[]
}

export interface FarmResponse {
  success: boolean
  farm: Farm
  message: string
}

export interface ImagesResponse {
  success: boolean
  images: FarmImage[]
}

export interface ImageResponse {
  success: boolean
  image: FarmImage
  message: string
}

export interface DeleteResponse {
  success: boolean
  message: string
}

/**
 * Get all farms for the current user
 */
export async function getUserFarms(userId: string): Promise<FarmsResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}`, {
      method: 'GET'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching user farms:', error)
    throw error
  }
}

/**
 * Create a new farm
 */
export async function createFarm(userId: string, farmData: CreateFarmRequest): Promise<FarmResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(farmData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating farm:', error)
    throw error
  }
}

/**
 * Update an existing farm
 */
export async function updateFarm(userId: string, farmId: string, farmData: UpdateFarmRequest): Promise<FarmResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}/${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(farmData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating farm:', error)
    throw error
  }
}

/**
 * Delete a farm
 */
export async function deleteFarm(userId: string, farmId: string): Promise<DeleteResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}/${farmId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting farm:', error)
    throw error
  }
}

/**
 * Get all images for a farm
 */
export async function getFarmImages(userId: string, farmId: string, category?: 'leaf' | 'soil' | 'insects'): Promise<ImagesResponse> {
  try {
    const url = category 
      ? `${API_BASE_URL}/api/farms/${userId}/${farmId}/images?category=${category}`
      : `${API_BASE_URL}/api/farms/${userId}/${farmId}/images`
    
    const response = await smartFetch(url, {
      method: 'GET'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching farm images:', error)
    throw error
  }
}

/**
 * Upload an image for a farm
 */
export async function uploadFarmImage(
  userId: string, 
  farmId: string, 
  category: 'leaf' | 'soil' | 'insects', 
  file: File
): Promise<ImageResponse> {
  try {
    const formData = new FormData()
    formData.append('category', category)
    formData.append('file', file)
    
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}/${farmId}/images`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error uploading farm image:', error)
    throw error
  }
}

/**
 * Delete a farm image
 */
export async function deleteFarmImage(
  userId: string, 
  farmId: string, 
  category: 'leaf' | 'soil' | 'insects', 
  filename: string
): Promise<DeleteResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}/${farmId}/images/${category}/${filename}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting farm image:', error)
    throw error
  }
}

/**
 * Update last chat date for a farm
 */
export async function updateLastChatDate(userId: string, farmId: string): Promise<DeleteResponse> {
  try {
    const response = await smartFetch(`${API_BASE_URL}/api/farms/${userId}/${farmId}/last_chat`, {
      method: 'PUT'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating last chat date:', error)
    throw error
  }
}

/**
 * Get the full URL for a farm image
 */
export function getFarmImageUrl(userId: string, farmId: string, category: 'leaf' | 'soil' | 'insects', filename: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  return `${baseUrl}/api/farms/${userId}/${farmId}/images/${category}/${filename}`
}
