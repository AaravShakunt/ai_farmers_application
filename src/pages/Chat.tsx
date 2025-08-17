import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { ChatSession } from '../types'
import { createNewChatSession, generateChatSummary, checkChatHealth } from '../services/chatApi'
import { workflowApi } from '../services/workflowApi'
import { CacheManager } from '../lib/cache'
import { BottomNav } from '../components/ui/BottomNav'
import { ChatInterface } from '../components/chat/ChatInterface'
import { useI18n } from '../i18n'

type ImageCategory = 'leaf' | 'soil' | 'insects'

interface UploadedImage {
  id: string
  category: ImageCategory
  file: File
  url: string
  timestamp: string
  name: string
  chatSessionId: string
}

export default function Chat() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [chatHealthy, setChatHealthy] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('leaf')
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    
    // Load saved images from localStorage
    const savedImages = localStorage.getItem('chatImages')
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages))
    }
  }, [])

  // Save images to localStorage whenever uploadedImages changes
  useEffect(() => {
    localStorage.setItem('chatImages', JSON.stringify(uploadedImages))
  }, [uploadedImages])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !session) return

    const timestamp = new Date().toLocaleString()
    const name = `${selectedCategory}_${timestamp.replace(/[/,:]/g, '-')}`
    
    const newImage: UploadedImage = {
      id: uuid(),
      category: selectedCategory,
      file,
      url: URL.createObjectURL(file),
      timestamp,
      name,
      chatSessionId: session.id
    }

    setUploadedImages(prev => [...prev, newImage])
    setShowImageModal(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getImagesByCategory = (category: ImageCategory) => {
    return uploadedImages.filter(img => img.category === category && img.chatSessionId === session?.id)
  }

  const getCategoryIcon = (category: ImageCategory) => {
    switch (category) {
      case 'leaf': return '🍃'
      case 'soil': return '🌱'
      case 'insects': return '🐛'
    }
  }

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
          images: uploadedImages.filter(img => img.chatSessionId === session.id),
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
          images: uploadedImages.filter(img => img.chatSessionId === session.id),
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
            uploadedImages={uploadedImages}
          />
        )}

        {/* Image Upload Button */}
        {!ended && session && (
          <div className="fixed bottom-20 right-4 z-20">
            <button
              onClick={() => {
                setSelectedCategory('leaf')
                setShowImageModal(true)
              }}
              className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 relative group"
              title="Upload image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadedImages.filter(img => img.chatSessionId === session?.id).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-pulse">
                  {uploadedImages.filter(img => img.chatSessionId === session?.id).length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Image Upload Modal with Category Selection */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Upload Image</h3>
                <button 
                  onClick={() => setShowImageModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-xs opacity-80 mt-1">Select category and upload image for AI analysis</p>
            </div>
            
            <div className="p-6">
              {/* Category Selection */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">Select Image Category</div>
                <div className="grid grid-cols-3 gap-3">
                  {(['leaf', 'soil', 'insects'] as ImageCategory[]).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-colors text-center ${
                        selectedCategory === category
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300 text-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                      <div className="text-xs font-medium capitalize">{category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Category Display */}
              <div className="mb-4 text-center">
                <div className="text-4xl mb-2">{getCategoryIcon(selectedCategory)}</div>
                <div className="text-lg font-semibold capitalize text-gray-900">{selectedCategory} Image</div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border-2 border-dashed border-gray-300 bg-white text-gray-900 rounded-lg hover:border-green-400 transition-colors"
                />
              </div>

              <div className="text-xs text-gray-500 text-center">
                Images will be saved with timestamp and linked to this chat session.
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
