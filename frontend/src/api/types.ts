
/**
 * API response types for the Retriever Essentials Dashboard.
 */

// Existing backend health response
export interface HealthResponse {
  status: string
  database: string
}

// Response from POST /uploads. Mirrors backend/app/schemas/upload.py (UploadResponse)
export interface UploadResult {
  rows_inserted: number
}

// One row from GET /metrics. Mirrors backend/app/schemas/metrics.py (WeeklyMetricOut)
export interface WeeklyMetric {
  id: number
  week_start: string
  demographic_group: string
  metric: string
  count: number
}
