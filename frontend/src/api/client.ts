
import type {
  HealthResponse,
  NotImplementedResponse,
  MetricsResponse
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Raised when the backend responds with a non-2xx status. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** True when a request was cancelled via its AbortSignal, so callers can ignore it. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

// FastAPI sends `detail` as a string for HTTPException, but as a list of
// { loc, msg, type } objects for 422 validation errors.
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as { msg?: unknown })?.msg)
      .filter((msg): msg is string => typeof msg === 'string')
    if (messages.length > 0) return messages.join('; ')
  }
  return fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(body, response.statusText))
  }
  return body as T
}

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return request<HealthResponse>('/health', { signal })
}

/** Retrieve weekly metrics for the dashboard bar chart. */
export function getMetrics(signal?: AbortSignal): Promise<MetricsResponse> {
  return request<MetricsResponse>('/metrics', { signal })
}

// TODO: replace NotImplementedResponse with the real upload result shape once the endpoint exists
export function uploadCsv(file: File): Promise<NotImplementedResponse> {
  const form = new FormData()
  form.append('file', file)
  return request<NotImplementedResponse>('/uploads', { method: 'POST', body: form })
}
