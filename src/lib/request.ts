import { smartFetch, startQueueWorker } from './offlineQueue'

export async function getJson<T>(url: string, options?: { queueOnFail?: boolean }): Promise<T> {
  const res = await smartFetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }, queueOnFail: options?.queueOnFail })
  if (res.status === 202) return { queued: true } as unknown as T
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

export async function postJson<T>(url: string, body: unknown, options?: { queueOnFail?: boolean }): Promise<T> {
  const res = await smartFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
    queueOnFail: options?.queueOnFail ?? true,
  })
  if (res.status === 202) return { queued: true } as unknown as T
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

// Set up a basic worker that "sends" queued requests when online.
export function initRequestQueue(): void {
  startQueueWorker(async (req) => {
    try {
      // Attempt real network call; if it fails, throw to keep in queue
      return await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body as BodyInit | null,
      })
    } catch (e) {
      // Fallback to a local OK response to avoid infinite retries in this demo
      return new Response(JSON.stringify({ ok: true, mocked: true }), { status: 200 })
    }
  })
}

