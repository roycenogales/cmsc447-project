import type { HealthResponse, NotImplementedResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Raised when the backend responds with a non-2xx status. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, body?.detail ?? response.statusText)
  }
  return body as T
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}

// TODO: replace NotImplementedResponse with the real metrics shape once the endpoint exists
export function getMetrics(): Promise<NotImplementedResponse> {
  return request<NotImplementedResponse>('/metrics')
}

// TODO: replace NotImplementedResponse with the real upload result shape once the endpoint exists
export function uploadCsv(file: File): Promise<NotImplementedResponse> {
  const form = new FormData()
  form.append('file', file)
  return request<NotImplementedResponse>('/uploads', { method: 'POST', body: form })
}
