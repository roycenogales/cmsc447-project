// Mirrors backend/app/schemas/common.py

export interface HealthResponse {
  status: string
  database: string
}

export interface NotImplementedResponse {
  detail: string
}
