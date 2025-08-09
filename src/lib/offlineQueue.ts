import localforage from 'localforage'
import { v4 as uuid } from 'uuid'
import type { QueuedRequest } from '../types'

const QUEUE_KEY = 'offline:request-queue'

const store = localforage.createInstance({ name: 'ai-farmers', storeName: 'offline-queue' })

async function getQueue(): Promise<QueuedRequest[]> {
  return (await store.getItem<QueuedRequest[]>(QUEUE_KEY)) ?? []
}

async function setQueue(queue: QueuedRequest[]): Promise<void> {
  await store.setItem(QUEUE_KEY, queue)
}

export async function pingInternet(): Promise<boolean> {
  // Mock ping: 100ms delay and rely on navigator.onLine as a base signal
  await new Promise((r) => setTimeout(r, 100))
  return navigator.onLine
}

export async function enqueueRequest(request: Omit<QueuedRequest, 'id' | 'createdAt'>): Promise<QueuedRequest> {
  const newReq: QueuedRequest = { id: uuid(), createdAt: Date.now(), ...request }
  const queue = await getQueue()
  queue.push(newReq)
  await setQueue(queue)
  return newReq
}

export async function processQueue(sendFn: (req: QueuedRequest) => Promise<Response>): Promise<void> {
  if (!(await pingInternet())) return
  const queue = await getQueue()
  const remaining: QueuedRequest[] = []

  for (const req of queue) {
    try {
      await sendFn(req)
    } catch {
      remaining.push(req)
    }
  }
  await setQueue(remaining)
}

export async function smartFetch(url: string, init?: RequestInit & { queueOnFail?: boolean }): Promise<Response> {
  const canSend = await pingInternet()
  if (canSend) {
    try {
      return await fetch(url, init)
    } catch (err) {
      if (init?.queueOnFail) {
        await enqueueRequest({ url, method: (init?.method as any) ?? 'GET', headers: init?.headers as any, body: init?.body })
      }
      throw err
    }
  }
  if (init?.queueOnFail) {
    await enqueueRequest({ url, method: (init?.method as any) ?? 'GET', headers: init?.headers as any, body: init?.body })
  }
  return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { 'Content-Type': 'application/json' } })
}

// Periodically try to flush queue when reconnecting
export function startQueueWorker(sendFn: (req: QueuedRequest) => Promise<Response>): void {
  const tryFlush = async () => {
    if (await pingInternet()) {
      await processQueue(sendFn)
    }
  }
  window.addEventListener('online', tryFlush)
  setInterval(tryFlush, 5000)
}

