import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { ChatMessage, ChatSession } from '../../types'
import { sendMessageToGemini } from '../../services/chatApi'
import { OnlineVoiceInput } from '../ui/OnlineVoiceInput'
import { OfflineVoiceInput } from '../ui/OfflineVoiceInput'
import { VoiceSupport } from '../ui/VoiceSupport'

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate: (session: ChatSession) => void
  onEndChat: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  ended: boolean
  chatHealthy: boolean
  uploadedImages?: any[] // For image context
}

export function ChatInterface({
  session,
  onSessionUpdate,
  onEndChat,
  loading,
  setLoading,
  ended,
  chatHealthy,
  uploadedImages = []
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [enableRAG, setEnableRAG] = useState(true)
  const [ragRegion, setRAGRegion] = useState<string>('india')
  const [ragCategory, setRAGCategory] = useState<string>('')
  const [showRAGSettings, setShowRAGSettings] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session.messages.length])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || !chatHealthy || loading || ended) return
    
    const userMsg: ChatMessage = { 
      id: uuid(), 
      role: 'user', 
      content: textToSend, 
      createdAt: Date.now() 
    }
    const updatedMessages = [...session.messages, userMsg]
    
    onSessionUpdate({ ...session, messages: updatedMessages })
    if (!messageText) setInput('')
    setLoading(true)
    
    try {
      // Prepare context for expert system
      const context: Record<string, any> = {}
      
      // Add image context if images are uploaded for this session
      const sessionImages = uploadedImages.filter(img => img.chatSessionId === session.id)
      if (sessionImages.length > 0) {
        // For now, we'll just indicate that images are available
        // In a full implementation, you'd need to convert images to base64 or upload them
        context.hasImages = true
        context.imageCount = sessionImages.length
        context.imageCategories = [...new Set(sessionImages.map(img => img.category))]
      }
      
      const assistantMsg = await sendMessageToGemini(updatedMessages, {
        temperature: 0.7,
        max_tokens: 1024,
        use_expert_system: true,
        expert_confidence_threshold: 10.0,
        context: Object.keys(context).length > 0 ? context : undefined
      })
      
      const messagesWithAssistant = [...updatedMessages, assistantMsg]
      onSessionUpdate({ ...session, messages: messagesWithAssistant })
      
      // Add menu message after assistant response
      const menuMsg: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: 'CHAT_MENU',
        createdAt: Date.now()
      }
      onSessionUpdate({ 
        ...session, 
        messages: [...messagesWithAssistant, menuMsg] 
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Add error message
      const errorMsg: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        createdAt: Date.now()
      }
      onSessionUpdate({ 
        ...session, 
        messages: [...updatedMessages, errorMsg] 
      })
    }
    
    setLoading(false)
  }

  const handleContinueChat = () => {
    const messagesWithoutMenu = session.messages.filter(msg => msg.content !== 'CHAT_MENU')
    onSessionUpdate({ ...session, messages: messagesWithoutMenu })
  }

  // Handle real-time voice transcript updates
  const handleVoiceTranscriptChange = (transcript: string) => {
    setInput(transcript)
  }

  // Handle voice recording state changes
  const handleVoiceRecordingChange = (isRecording: boolean) => {
    setIsVoiceRecording(isRecording)
    if (!isRecording) {
      // Clear input when recording stops (transcript will be sent via onTranscript)
      setInput('')
    }
  }


  const canSend = useMemo(() => 
    !!input.trim() && !loading && !ended && chatHealthy, 
    [input, loading, ended, chatHealthy]
  )

  return (
    <>
      {/* Voice Support Notice */}
      <VoiceSupport />
      
      {/* Chat Messages Area */}
      <div className="space-y-3 mb-20">
        {session.messages.map((m) => {
          // Special handling for menu message
          if (m.content === 'CHAT_MENU') {
            return (
              <div key={m.id} className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-sm max-w-xs">
                  <div className="text-sm text-gray-800 mb-3">
                    What would you like to do next?
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={onEndChat}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      End Chat & Get Workflow
                    </button>
                    <button
                      onClick={handleContinueChat}
                      className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Continue Chatting
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                m.role === 'user' 
                  ? 'bg-green-500 text-white rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md'
              }`}>
                <div className="text-sm leading-relaxed">{m.content}</div>
                <div className={`text-xs mt-1 ${
                  m.role === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* Show expert system info for assistant messages */}
                {m.role === 'assistant' && (m as any).expertInfo && (
                  <div className="text-xs mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-600">
                      🤖 Expert System: {(m as any).expertInfo.experts_consulted?.join(', ') || 'Standard'}
                    </div>
                    {(m as any).expertInfo.expert_processing_time && (
                      <div className="text-gray-500">
                        ⏱️ {((m as any).expertInfo.expert_processing_time).toFixed(2)}s
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {loading && !ended && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-sm max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* RAG Settings Modal */}
      {showRAGSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">AI Enhancement Settings</h3>
                <button 
                  onClick={() => setShowRAGSettings(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-xs opacity-80 mt-1">Configure knowledge base assistance</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Enable RAG Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Knowledge Base Assistance
                </label>
                <button
                  onClick={() => setEnableRAG(!enableRAG)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableRAG ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableRAG ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {enableRAG && (
                <>
                  {/* Region Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={ragRegion}
                      onChange={(e) => setRAGRegion(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="india">India</option>
                      <option value="usa">United States</option>
                      <option value="australia">Australia</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <select
                      value={ragCategory}
                      onChange={(e) => setRAGCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="crop_management">Crop Management</option>
                      <option value="pest_disease">Pest & Disease</option>
                      <option value="weather">Weather</option>
                      <option value="market_prices">Market Prices</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!ended && (
        <div className="fixed inset-x-0 bottom-16 bg-white border-t border-gray-200 py-4 px-4 z-10 shadow-lg">
          <div className="mx-auto max-w-screen-md flex items-center space-x-3">
            {/* Voice Input Button */}
            <OnlineVoiceInput
              onTranscript={(transcript) => handleSend(transcript)}
              onTranscriptChange={handleVoiceTranscriptChange}
              onRecordingChange={handleVoiceRecordingChange}
              disabled={!chatHealthy || loading || ended}
              className="flex-shrink-0"
            />

            {/* Input Field */}
            <input
              type="text"
              className="flex-1 bg-gray-50 text-gray-900 px-4 py-3 rounded-2xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none placeholder-gray-500 text-base"
              placeholder={chatHealthy ? "Type a message..." : "Type a message... (limited functionality)"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend(); 
                } 
              }}
              disabled={loading || ended}
              autoComplete="off"
            />
            
            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl transition-all duration-200 ${
                canSend 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}

    </>
  )
}
