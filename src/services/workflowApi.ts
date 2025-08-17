const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface WorkflowTask {
  id: string
  title: string
  estimated_time: string
  completed: boolean
}

export interface WorkflowResponse {
  tasks: WorkflowTask[]
  generated_from_chat: boolean
}

export interface ChatMessage {
  role: string
  content: string
}

export interface WorkflowGenerationRequest {
  chat_messages: ChatMessage[]
  plot_id?: string
  crop_type?: string
}

export const workflowApi = {
  async getDefaultWorkflows(cropType: string = 'general'): Promise<WorkflowResponse> {
    const response = await fetch(`${API_BASE_URL}/workflows/default/${cropType}`)
    if (!response.ok) {
      throw new Error('Failed to fetch default workflows')
    }
    return response.json()
  },

  async generateWorkflowsFromChat(request: WorkflowGenerationRequest): Promise<WorkflowResponse> {
    const response = await fetch(`${API_BASE_URL}/workflows/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      throw new Error('Failed to generate workflows from chat')
    }
    return response.json()
  }
}