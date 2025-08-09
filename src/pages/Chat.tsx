import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { ChatMessage, ChatSession } from '../types'
import { createNewChat, sendChatMessage, summarizeChat } from '../services/mockApi'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Chat() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [summary, setSummary] = useState<{ summary: string; points: Array<{ label: string; value: number }> } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createNewChat().then(setSession)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length])

  const handleSend = async () => {
    if (!session || !input.trim()) return
    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: input.trim(), createdAt: Date.now() }
    setSession({ ...session, messages: [...session.messages, userMsg] })
    setInput('')
    setLoading(true)
    const assistant = await sendChatMessage([...session.messages, userMsg])
    setSession((prev) => (prev ? { ...prev, messages: [...prev.messages, assistant] } : prev))
    setLoading(false)
  }

  const endChat = async () => {
    if (!session) return
    setEnded(true)
    setLoading(true)
    const res = await summarizeChat(session.messages)
    setSummary(res)
    setLoading(false)
  }

  const canSend = useMemo(() => !!input.trim() && !loading && !ended, [input, loading, ended])

  return (
    <div className="container-app pb-24">
      <div className="flex items-center justify-between py-3">
        <h1 className="text-xl font-bold">Chatbot</h1>
        {!ended ? (
          <button className="btn-secondary" onClick={endChat} disabled={!session || session.messages.length === 0}>End Chat</button>
        ) : (
          <div className="text-sm text-gray-600">Chat ended</div>
        )}
      </div>

      <div className="space-y-3">
        {session?.messages.map((m) => (
          <div key={m.id} className={`rounded-xl p-3 ${m.role === 'user' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
            <div className="text-xs text-gray-500">{m.role === 'user' ? 'You' : 'Assistant'}</div>
            <div className="mt-1 text-sm leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading && !ended && <div className="text-sm text-gray-500">Assistant is typing…</div>}
        <div ref={endRef} />
      </div>

      {!ended && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-white p-3">
          <div className="container-app">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-2"
                placeholder="Type your message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              />
              <button className="btn" onClick={handleSend} disabled={!canSend}>Send</button>
            </div>
          </div>
        </div>
      )}

      {ended && (
        <div className="mt-6">
          <div className="card">
            <h2 className="text-lg font-semibold">Chat Summary</h2>
            {loading && <div className="mt-2 text-sm text-gray-500">Summarizing…</div>}
            {summary && (
              <>
                <p className="mt-2 text-sm leading-relaxed">{summary.summary}</p>
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.points}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

