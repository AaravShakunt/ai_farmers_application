import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { ChatMessage, ChatSession } from '../types'
import { createNewChat, sendChatMessage, summarizeChat } from '../services/mockApi'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/ui/BottomNav'
import { useI18n } from '../i18n'

export default function Chat() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ended, setEnded] = useState(false)
  const [summary, setSummary] = useState<{ summary: string; points: Array<{ label: string; value: number }> } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

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
    <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      <div className="flex items-center justify-between py-3">
        <h1 className="text-xl font-bold">{t('chatbot')}</h1>
        {!ended ? (
          <Button variant="secondary" onClick={endChat} disabled={!session || session.messages.length === 0}>{t('end_chat')}</Button>
        ) : (
          <div className="text-sm text-gray-600">{t('chat_ended')}</div>
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
        <div className="fixed inset-x-0 bottom-0 border-t bg-white p-3 pb-6">
          <div className="mx-auto max-w-screen-md">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2"
                placeholder="Type your message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              />
              <Button onClick={handleSend} disabled={!canSend}>{t('send')}</Button>
            </div>
          </div>
        </div>
      )}

      {ended && (
        <div className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Chat Summary</h2>
            {loading && <div className="mt-2 text-sm text-gray-500">{t('summarizing')}</div>}
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

      <BottomNav />
    </div>
  )
}

