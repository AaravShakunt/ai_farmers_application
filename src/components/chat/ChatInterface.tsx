import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { ChatMessage, ChatSession } from '../../types'
import { sendMessageToGemini } from '../../services/chatApi'
import { VoiceInput } from '../ui/VoiceInput'
import { VoiceSupport } from '../ui/VoiceSupport'

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate: (session: ChatSession) => void
  onEndChat: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  ended: boolean
  chatHealthy: boolean
}

export function ChatInterface({
  session,
  onSessionUpdate,
  onEndChat,
  loading,
  setLoading,
  ended,
  chatHealthy
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
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
      const assistantMsg = await sendMessageToGemini(updatedMessages, {
        temperature: 0.7,
        max_tokens: 1024,
        enable_rag: false
      })
      
      onSessionUpdate({ ...session, messages: [...updatedMessages, assistantMsg] })
      
      // Add menu message after assistant response
      const menuMsg: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: 'CHAT_MENU',
        createdAt: Date.now()
      }
      onSessionUpdate(prev => ({ 
        ...prev, 
        messages: [...prev.messages, menuMsg] 
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Add error message
      const errorMsg: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        createdAt: Date.now()
      }
      onSessionUpdate(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMsg] 
      }))
    }
    
    setLoading(false)
  }

  const handleContinueChat = () => {
    const messagesWithoutMenu = session.messages.filter(msg => msg.content !== 'CHAT_MENU')
    onSessionUpdate({ ...session, messages: messagesWithoutMenu })
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

      {/* Input Area */}
      {!ended && (
        <div className="fixed inset-x-0 bottom-16 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-gray-200/50 py-4 px-2 z-10 shadow-lg">
          <div className="mx-auto max-w-screen-md px-2">
            <div className="flex items-center justify-center space-x-2">
              {/* Voice Input Button */}
              <VoiceInput
                onTranscript={(transcript) => handleSend(transcript)}
                disabled={!chatHealthy || loading || ended}
                className="flex-shrink-0"
              />
              
              {/* Message Input Container */}
              <div className="flex-1 max-w-[75%] relative">
                <div className="relative bg-white rounded-3xl shadow-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all duration-200">
                  <input
                    className="w-full bg-transparent text-gray-900 rounded-3xl px-6 py-3.5 pr-16 focus:outline-none placeholder-gray-500 text-base"
                    placeholder={chatHealthy ? "Type a message..." : "Chat service unavailable"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                    disabled={!chatHealthy}
                  />
                  
                  {/* Send Button */}
                  <button
                    onClick={() => handleSend()}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}