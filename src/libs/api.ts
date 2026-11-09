import type { ApiResult, Registration, Workshop } from '@/interface'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000'

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}

// Calls the workshop backend and normalizes its { success, data, error } responses
export async function apiFetch<T>(path: string, { method = 'GET', token, body }: FetchOptions = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
      method,
      cache: 'no-store',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      if (res.status === 401 && token) {
        return { ok: false, status: 401, error: 'Your session has expired. Please sign in again.' }
      }
      return { ok: false, status: res.status, error: json?.error ?? `Request failed (${res.status})` }
    }
    return { ok: true, data: json.data as T, count: json.count }
  } catch {
    return { ok: false, status: 0, error: 'Cannot reach the workshop server. Is the backend running?' }
  }
}

export function getWorkshops(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<Workshop[]>(`/workshops${query}`)
}

export function getWorkshop(id: string) {
  return apiFetch<Workshop>(`/workshops/${encodeURIComponent(id)}`)
}

export function getRegistrations(token: string) {
  return apiFetch<Registration[]>('/registrations', { token })
}
