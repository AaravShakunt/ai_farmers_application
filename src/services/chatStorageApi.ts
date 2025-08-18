import { smartFetch } from '../lib/offlineQueue'

export interface ChatSession {
  session_id: string
  mobile_number: string
  farm_name: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
  images: SessionImage[]
  status: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface SessionImage {
  image_id: string
  filename: string
  original_name: string
  category: string
  uploaded_at: string
  file_path: string
}

export interface UserStats {
  total_sessions: number
  active_sessions: number
  total_messages: number
  total_images: number
  last_activity: string | null
}

class ChatStorageApi {
  private baseUrl = '/api/chat'

  async createSession(mobileNumber: string, farmName: string, initialMessage?: string): Promise<ChatSession> {
    const formData = new FormData()
    formData.append('mobile_number', mobileNumber)
    formData.append('farm_name', farmName)
    if (initialMessage) {
      formData.append('initial_message', initialMessage)
    }

    const response = await smartFetch(`${this.baseUrl}/session/new`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.session
  }

  async addMessageToSession(
    sessionId: string, 
    mobileNumber: string, 
    farmName: string, 
    role: 'user' | 'assistant', 
    content: string
  ): Promise<void> {
    const formData = new FormData()
    formData.append('mobile_number', mobileNumber)
    formData.append('farm_name', farmName)
    formData.append('role', role)
    formData.append('content', content)

    const response = await smartFetch(`${this.baseUrl}/session/${sessionId}/message`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to add message: ${response.statusText}`)
    }
  }

  async addImageToSession(
    sessionId: string,
    mobileNumber: string,
    farmName: string,
    image: File,
    category: string = 'general'
  ): Promise<string> {
    const formData = new FormData()
    formData.append('mobile_number', mobileNumber)
    formData.append('farm_name', farmName)
    formData.append('category', category)
    formData.append('image', image)

    const response = await smartFetch(`${this.baseUrl}/session/${sessionId}/image`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Failed to add image: ${response.statusText}`)
    }

    const data = await response.json()
    return data.image_id
  }

  async removeImageFromSession(
    sessionId: string,
    imageId: string,
    mobileNumber: string,
    farmName: string
  ): Promise<void> {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName
    })

    const response = await smartFetch(
      `${this.baseUrl}/session/${sessionId}/image/${imageId}?${params}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to remove image: ${response.statusText}`)
    }
  }

  async getUserSessions(
    mobileNumber: string,
    farmName: string,
    limit: number = 10
  ): Promise<ChatSession[]> {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName,
      limit: limit.toString()
    })

    const response = await smartFetch(`${this.baseUrl}/sessions?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get sessions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sessions
  }

  async getSessionDetails(
    sessionId: string,
    mobileNumber: string,
    farmName: string
  ): Promise<ChatSession> {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName
    })

    const response = await smartFetch(`${this.baseUrl}/session/${sessionId}?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.session
  }

  async getSessionImage(
    sessionId: string,
    imageId: string,
    mobileNumber: string,
    farmName: string
  ): Promise<Blob> {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName
    })

    const response = await smartFetch(
      `${this.baseUrl}/session/${sessionId}/image/${imageId}?${params}`
    )

    if (!response.ok) {
      throw new Error(`Failed to get image: ${response.statusText}`)
    }

    return response.blob()
  }

  async getUserStats(mobileNumber: string, farmName: string): Promise<UserStats> {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName
    })

    const response = await smartFetch(`${this.baseUrl}/user/stats?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get stats: ${response.statusText}`)
    }

    const data = await response.json()
    return data.stats
  }

  // Helper method to get image URL for display
  getImageUrl(
    sessionId: string,
    imageId: string,
    mobileNumber: string,
    farmName: string
  ): string {
    const params = new URLSearchParams({
      mobile_number: mobileNumber,
      farm_name: farmName
    })

    return `${this.baseUrl}/session/${sessionId}/image/${imageId}?${params}`
  }
}

export const chatStorageApi = new ChatStorageApi()
