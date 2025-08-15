import { APP_CONFIG } from '../config'
import type { ChatMessage, ChatSession } from '../types'

export interface ChatApiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatApiMessage[]
  temperature?: number
  max_tokens?: number
  enable_rag?: boolean
}

export interface ChatResponse {
  message: string
  model: string
  finish_reason: string
}

export interface NewSessionResponse {
  session_id: string
  system_message: ChatApiMessage
  status: string
}

/**
 * Create a new chat session with agricultural context
 */
export async function createNewChatSession(): Promise<ChatSession> {
  try {
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/chat/session/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const data: NewSessionResponse = await response.json()
    
    return {
      id: data.session_id,
      messages: [],
      createdAt: Date.now()
    }
  } catch (error) {
    console.error('Failed to create chat session:', error)
    throw new Error('Failed to create chat session')
  }
}

/**
 * Send message to Gemini AI through backend
 */
export async function sendMessageToGemini(
  messages: ChatMessage[],
  options: {
    temperature?: number
    max_tokens?: number
    enable_rag?: boolean
  } = {}
): Promise<ChatMessage> {
  try {
    // Convert ChatMessage[] to ChatApiMessage[] format
    const apiMessages: ChatApiMessage[] = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }))

    // Add system message for agricultural context if not present
    const hasSystemMessage = apiMessages.some(msg => msg.role === 'system')
    if (!hasSystemMessage) {
      apiMessages.unshift({
        role: 'system',
        content: `You are an AI assistant specialized in agricultural support for farmers. 
        You have expertise in crop diseases, pest management, weather-based farming advice, 
        market guidance, and sustainable practices. Provide practical, actionable advice 
        tailored to farming needs.`
      })
    }

    const chatRequest: ChatRequest = {
      messages: apiMessages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      enable_rag: options.enable_rag || false
    }

    const response = await fetch(`${APP_CONFIG.api.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatRequest)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(`Chat API failed: ${errorData.detail || response.statusText}`)
    }

    const data: ChatResponse = await response.json()

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: data.message,
      createdAt: Date.now()
    }
  } catch (error) {
    console.error('Failed to send message to Gemini:', error)
    throw new Error('Failed to get AI response. Please try again.')
  }
}

/**
 * Check if chat service is healthy
 */
export async function checkChatHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/chat/health`)
    
    if (!response.ok) {
      return false
    }

    const data: { status: string, api_configured: boolean } = await response.json()
    return data.status === 'healthy' && data.api_configured
  } catch (error) {
    console.error('Chat health check failed:', error)
    return false
  }
}

/**
 * Generate chat summary (placeholder for future enhancement)
 */
export async function generateChatSummary(messages: ChatMessage[]): Promise<string> {
  try {
    // For now, use the existing summarizeChat logic
    // In the future, this could use Gemini to generate better summaries
    const userMessages = messages.filter(m => m.role === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]
    
    if (!lastUserMessage) {
      return 'Chat session completed'
    }

    // Simple summary based on last user message
    const content = lastUserMessage.content.toLowerCase()
    if (content.includes('disease') || content.includes('pest')) {
      return 'Plant disease and pest management consultation'
    } else if (content.includes('weather') || content.includes('rain')) {
      return 'Weather-based farming advice session'
    } else if (content.includes('price') || content.includes('market')) {
      return 'Market price and selling guidance'
    } else {
      return 'General agricultural consultation'
    }
  } catch (error) {
    console.error('Failed to generate chat summary:', error)
    return 'Chat session completed'
  }
}