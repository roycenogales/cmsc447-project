
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ApiError,
  getMetrics,
  isAbortError
} from '../api/client'
import type { WeeklyMetric } from '../api/types'
import './DashboardPage.css'

/** Display useful messages for backend errors. */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 501) {
      return 'Metrics are not available yet (501). The backend team still needs to implement GET /metrics.'
    }

    return `Could not load metrics (${error.status}): ${error.message}`
  }

  return error instanceof Error
    ? error.message
    : 'Unable to load dashboard metrics.'
}

/** Display weekly metrics for one demographic group and metric as a bar chart. */
export default function DashboardPage() {
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('')

  // Retrieve dashboard metrics when the page loads
  useEffect(() => {
    const controller = new AbortController()

    getMetrics(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return

        if (!Array.isArray(data)) {
          throw new Error(
            'Unexpected metrics response. Expected a list of metric rows.'
          )
        }

        setMetrics(data)
      })
      .catch((caught: unknown) => {
        if (
          controller.signal.aborted ||
          isAbortError(caught)
        ) {
          return
        }

        // The backend returns 404 when no metrics have been uploaded yet
        if (caught instanceof ApiError && caught.status === 404) {
          setMetrics([])
          return
        }

        setError(getErrorMessage(caught))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  // Get the available demographic groups and metrics from the data
  const groups = [
    ...new Set(metrics.map((row) => row.demographic_group))
  ].sort()
  const metricNames = [
    ...new Set(metrics.map((row) => row.metric))
  ].sort()

  // Default to the first available option
  const currentGroup = groups.includes(selectedGroup)
    ? selectedGroup
    : (groups[0] ?? '')
  const currentMetric = metricNames.includes(selectedMetric)
    ? selectedMetric
    : (metricNames[0] ?? '')

  // Rows for the selected group and metric, oldest week first
  const visibleMetrics = metrics
    .filter(
      (row) =>
        row.demographic_group === currentGroup &&
        row.metric === currentMetric
    )
    .sort(
      (a, b) => a.week_start.localeCompare(b.week_start)
    )

  // Table of every week x demographic group for the selected metric
  const counts = new Map(
    metrics
      .filter((row) => row.metric === currentMetric)
      .map((row) => [`${row.week_start}|${row.demographic_group}`, row.count])
  )
  const tableWeeks = [
    ...new Set(
      metrics
        .filter((row) => row.metric === currentMetric)
        .map((row) => row.week_start)
    )
  ].sort()

  // Find the largest value for scaling bar widths
  const largestValue = Math.max(
    1,
    ...visibleMetrics.map((row) => row.count)
  )

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
          No metrics available yet. <Link to="/upload">Upload a CSV</Link> to get started.
        </p>
      )}

      {/* Display chart when metrics are available */}
      {!loading && !error && metrics.length > 0 && (
        <div className="metrics-card">

          <div className="metrics-controls">
            {/* Demographic group filter */}
            <label htmlFor="group-filter">
              Demographic group
              <select
                id="group-filter"
                value={currentGroup}
                onChange={(event) =>
                  setSelectedGroup(event.target.value)
                }
              >
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            {/* Metric filter */}
            <label htmlFor="metric-filter">
              Metric
              <select
                id="metric-filter"
                value={currentMetric}
                onChange={(event) =>
                  setSelectedMetric(event.target.value)
                }
              >
                {metricNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h3>
            {currentMetric} by Week — {currentGroup}
          </h3>

          {visibleMetrics.length === 0 && (
            <p role="status">
              No {currentMetric} data for {currentGroup}.
            </p>
          )}

          {/* Bar chart */}
          <ol
            className="metric-bars"
            aria-label={`${currentMetric} for ${currentGroup} by reporting week`}
          >
            {visibleMetrics.map((row) => {
              const value = row.count

              const barWidth = Math.max(
                0,
                (value / largestValue) * 100
              )

              return (
                <li
                  className="metric-row"
                  key={row.id}
                >
                  {/* Week label */}
                  <span className="metric-week">
                    {row.week_start}
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

          {/* Every value for the selected metric */}
          <div className="metric-table-wrap">
            <table className="metric-table">
              <caption>
                All {currentMetric} values by week and demographic group
              </caption>
              <thead>
                <tr>
                  <th scope="col">Week</th>
                  {groups.map((group) => (
                    <th
                      scope="col"
                      key={group}
                      className={group === currentGroup ? 'selected' : undefined}
                    >
                      {group}
                    </th>
                  ))}
                  <th scope="col" className="total">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableWeeks.map((week) => {
                  const values = groups.map((group) =>
                    counts.get(`${week}|${group}`)
                  )
                  const total = values.reduce<number>(
                    (sum, value) => sum + (value ?? 0),
                    0
                  )

                  return (
                    <tr key={week}>
                      <th scope="row">{week}</th>
                      {values.map((value, index) => (
                        <td
                          key={groups[index]}
                          className={groups[index] === currentGroup ? 'selected' : undefined}
                        >
                          {value === undefined ? '—' : value.toLocaleString()}
                        </td>
                      ))}
                      <td className="total">{total.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
