
import { useEffect, useState } from 'react'
import {
  ApiError,
  getMetrics,
  isAbortError
} from '../api/client'
import type { WeeklyMetric } from '../api/types'
import './DashboardPage.css'

// Metrics available for the bar chart
type MetricField = 'visit_count' | 'unique_count'

/** Display useful messages for backend errors. */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'Metrics endpoint not found (404). Check that GET /metrics is registered on the backend.'
    }

    if (error.status === 501) {
      return 'Metrics are not available yet (501). The backend team still needs to implement GET /metrics.'
    }

    return `Could not load metrics (${error.status}): ${error.message}`
  }

  return error instanceof Error
    ? error.message
    : 'Unable to load dashboard metrics.'
}

/** Display weekly service metrics using a bar chart. */
export default function DashboardPage() {
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedService, setSelectedService] = useState('')
  const [metricField, setMetricField] =
    useState<MetricField>('visit_count')

  // Retrieve dashboard metrics when the page loads
  useEffect(() => {
    const controller = new AbortController()

    getMetrics(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return

        if (!Array.isArray(data?.metrics)) {
          throw new Error(
            'Unexpected metrics response. Expected an object containing a metrics array.'
          )
        }

        setMetrics(data.metrics)
      })
      .catch((caught: unknown) => {
        if (
          !controller.signal.aborted &&
          !isAbortError(caught)
        ) {
          setError(getErrorMessage(caught))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  // Get the available services
  const services = [
    ...new Set(metrics.map((metric) => metric.service_name))
  ].sort()

  // Default to the first available service
  const currentService = services.includes(selectedService)
    ? selectedService
    : (services[0] ?? '')

  // Filter metrics based on selected service
  const visibleMetrics = metrics
    .filter(
      (metric) => metric.service_name === currentService
    )
    .sort(
      (a, b) => a.week_start.localeCompare(b.week_start)
    )

  // Find the largest value for scaling bar widths
  const largestValue = Math.max(
    1,
    ...visibleMetrics.map((metric) => metric[metricField])
  )

  const metricLabel =
    metricField === 'visit_count'
      ? 'Service visits'
      : 'Unique records'

  return (
    <section className="dashboard-page">
      <h2>Retriever Essentials Dashboard</h2>

      <p className="dashboard-description">
        View weekly service activity and compare reported metrics.
      </p>

      {/* Loading state */}
      {loading && (
        <p role="status">Loading metrics...</p>
      )}

      {/* Error state */}
      {!loading && error && (
        <p role="alert" className="dashboard-error">
          {error}
        </p>
      )}

      {/* Empty data state */}
      {!loading && !error && metrics.length === 0 && (
        <p role="status">
          No metrics available yet.
        </p>
      )}

      {/* Display chart when metrics are available */}
      {!loading && !error && metrics.length > 0 && (
        <div className="metrics-card">

          <div className="metrics-controls">
            {/* Service filter */}
            <label htmlFor="service-filter">
              Service
              <select
                id="service-filter"
                value={currentService}
                onChange={(event) =>
                  setSelectedService(event.target.value)
                }
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>

            {/* Metric filter */}
            <label htmlFor="metric-filter">
              Metric
              <select
                id="metric-filter"
                value={metricField}
                onChange={(event) =>
                  setMetricField(
                    event.target.value as MetricField
                  )
                }
              >
                <option value="visit_count">
                  Total Visits
                </option>
                <option value="unique_count">
                  Unique Records
                </option>
              </select>
            </label>
          </div>

          <h3>
            {metricLabel} by Week — {currentService}
          </h3>

          {/* Bar chart */}
          <ol
            className="metric-bars"
            aria-label={`${metricLabel} by reporting week`}
          >
            {visibleMetrics.map((metric, index) => {
              const value = metric[metricField]

              const barWidth = Math.max(
                0,
                (value / largestValue) * 100
              )

              return (
                <li
                  className="metric-row"
                  key={`${metric.week_start}-${index}`}
                >
                  {/* Week label */}
                  <span className="metric-week">
                    {metric.week_start}
                  </span>

                  {/* Bar */}
                  <div
                    className="metric-track"
                    aria-hidden="true"
                  >
                    <div
                      className="metric-fill"
                      style={{
                        width: `${barWidth}%`
                      }}
                    />
                  </div>

                  {/* Actual value */}
                  <span className="metric-value">
                    {value.toLocaleString()}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}
