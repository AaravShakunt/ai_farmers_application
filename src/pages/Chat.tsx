import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ChatSession } from '../types'
import { createNewChatSession, generateChatSummary, checkChatHealth } from '../services/chatApi'
import { workflowApi } from '../services/workflowApi'
import { CacheManager } from '../lib/cache'
import { BottomNav } from '../components/ui/BottomNav'
import { ChatInterface } from '../components/chat/ChatInterface'
import { useI18n } from '../i18n'

export default function Chat() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [chatHealthy, setChatHealthy] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  
  const plotId = searchParams.get('plotId') || '1'

  useEffect(() => {
    // Check chat service health and create session
    const initializeChat = async () => {
      try {
        const healthy = await checkChatHealth()
        setChatHealthy(healthy)
        
        if (healthy) {
          const newSession = await createNewChatSession()
          setSession(newSession)
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        setChatHealthy(false)
      }
    }
    
    initializeChat()
  }, [])

  const handleEndChat = async () => {
    if (!session) return
    setEnded(true)
    setLoading(true)
    
    try {
      const chatSummary = await generateChatSummary(session.messages)
      
      // Try to generate workflows from the chat conversation and save to cache
      let workflowGenerated = false
      try {
        const chatMessages = session.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        
        // Determine crop type based on plotId
        const crop = plotId === '1' ? 'rice' : plotId === '3' ? 'cotton' : 'general'
        
        // Generate workflows for the specific crop
        const workflowResponse = await workflowApi.generateWorkflowsFromChat({
          chat_messages: chatMessages,
          plot_id: plotId,
          crop_type: crop
        })
        
        // Save generated workflows to cache if successful
        if (workflowResponse.generated_from_chat && workflowResponse.tasks.length > 0) {
          CacheManager.saveWorkflow(
            workflowResponse.tasks, 
            plotId, 
            session.id, 
            true
          )
          workflowGenerated = true
        }
      } catch (workflowError) {
        console.error('Failed to generate workflows:', workflowError)
        // Clear workflow cache on error to ensure defaults are loaded
        CacheManager.clearWorkflowCache()
      }
      
      setLoading(false)
      
      // Navigate to workflow page with chat data
      navigate(`/workflow?plotId=${plotId}`, { 
        state: { 
          chatSummary,
          chatId: session.id,
          workflowGenerated
        } 
      })
    } catch (error) {
      console.error('Failed to generate chat summary:', error)
      setLoading(false)
      
      // Clear workflow cache on error
      CacheManager.clearWorkflowCache()
      
      // Navigate anyway with a generic summary
      navigate(`/workflow?plotId=${plotId}`, { 
        state: { 
          chatSummary: { summary: 'Agricultural consultation completed' },
          chatId: session.id,
          workflowGenerated: false
        } 
      })
    }
  }


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Chat Health Status */}
        {!chatHealthy && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700 text-sm">
                Chat service unavailable. Please check your API configuration.
              </span>
            </div>
          </div>
        )}
        
        {/* Chat Interface */}
        {session && (
          <ChatInterface
            session={session}
            onSessionUpdate={setSession}
            onEndChat={handleEndChat}
            loading={loading}
            setLoading={setLoading}
            ended={ended}
            chatHealthy={chatHealthy}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
