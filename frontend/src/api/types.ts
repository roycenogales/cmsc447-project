
/**
 * API response types for the Retriever Essentials Dashboard.
 */

// Existing backend health response
export interface HealthResponse {
  status: string
  database: string
}

// Existing response for unfinished backend endpoints
export interface NotImplementedResponse {
  detail: string
}

// One week of service metrics
export interface WeeklyMetric {
  service_name: string
  week_start: string
  visit_count: number
  unique_count: number
}

// Expected response from GET /metrics
export interface MetricsResponse {
  metrics: WeeklyMetric[]
}
