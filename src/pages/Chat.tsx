import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { ChatMessage, ChatSession } from '../types'
import { createNewChat, sendChatMessage, summarizeChat } from '../services/mockApi'
import { BottomNav } from '../components/ui/BottomNav'
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
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('leaf')
  const endRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    createNewChat().then(setSession)
    // Load saved images from localStorage
    const savedImages = localStorage.getItem('chatImages')
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages))
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length])

  // Save images to localStorage whenever uploadedImages changes
  useEffect(() => {
    localStorage.setItem('chatImages', JSON.stringify(uploadedImages))
  }, [uploadedImages])

  const handleSend = async () => {
    if (!session || !input.trim()) return
    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: input.trim(), createdAt: Date.now() }
    setSession({ ...session, messages: [...session.messages, userMsg] })
    setInput('')
    setLoading(true)
    const assistant = await sendChatMessage([...session.messages, userMsg])
    setSession((prev) => (prev ? { ...prev, messages: [...prev.messages, assistant] } : prev))
    setLoading(false)
    
    // Add menu message after assistant response
    const menuMsg: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: 'CHAT_MENU',
      createdAt: Date.now()
    }
    setSession((prev) => (prev ? { ...prev, messages: [...prev.messages, menuMsg] } : prev))
  }

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
    const res = await summarizeChat(session.messages)
    setLoading(false)
    
    // Navigate to workflow page with chat data
    navigate('/workflow', { 
      state: { 
        chatSummary: res,
        chatId: session.id,
        images: uploadedImages.filter(img => img.chatSessionId === session.id)
      } 
    })
  }

  const handleContinueChat = () => {
    // Remove the menu message and continue
    if (session) {
      const messagesWithoutMenu = session.messages.filter(msg => msg.content !== 'CHAT_MENU')
      setSession({ ...session, messages: messagesWithoutMenu })
    }
  }

  const canSend = useMemo(() => !!input.trim() && !loading && !ended, [input, loading, ended])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Chat Messages Area */}
        <div className="space-y-3 mb-20">
          {session?.messages.map((m) => {
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
                        onClick={handleEndChat}
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
      </div>

      {/* Enhanced Aesthetic Input Area - Fixed above bottom nav */}
      {!ended && (
        <div className="fixed inset-x-0 bottom-16 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-gray-200/50 py-4 px-2 z-10 shadow-lg">
          <div className="mx-auto max-w-screen-md px-2">
            <div className="flex items-center justify-center space-x-2">
              {/* Smaller Image Upload Icon */}
              <button
                onClick={() => {
                  setSelectedCategory('leaf') // Default to leaf
                  setShowImageModal(true)
                }}
                className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 relative group"
                title="Upload image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {/* Enhanced image count badge */}
                {uploadedImages.filter(img => img.chatSessionId === session?.id).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-md animate-pulse">
                    {uploadedImages.filter(img => img.chatSessionId === session?.id).length}
                  </span>
                )}
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Upload Image
                </div>
              </button>

              {/* Smaller Voice Input Button */}
              <button
                className="flex-shrink-0 p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 relative group"
                title="Voice message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Voice Message
                </div>
              </button>

              {/* Enhanced Message Input Container - 85% width */}
              <div className="flex-1 max-w-[85%] relative">
                <div className="relative bg-white rounded-3xl shadow-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                  <input
                    className="w-full bg-transparent text-gray-900 rounded-3xl px-6 py-3.5 pr-16 focus:outline-none placeholder-gray-500 text-base"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                  />
                  
                  {/* Enhanced Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 rounded-2xl transition-all duration-200 ${
                      canSend 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                
                {/* Input field glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
