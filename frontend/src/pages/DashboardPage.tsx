import { useEffect, useState } from 'react'
import { getMetrics, isAbortError } from '../api/client'

/** Placeholder for the weekly metrics visualization. */
export default function DashboardPage() {
  const [message, setMessage] = useState('Loading metrics...')

  useEffect(() => {
    const controller = new AbortController()
    getMetrics(controller.signal)
      .then((data) => setMessage(data.detail))
      .catch((error: Error) => {
        if (!isAbortError(error)) setMessage(error.message)
      })
    return () => controller.abort()
  }, [])

  return (
    <section>
      <h2>Dashboard</h2>
      {/* TODO: render a chart of the selected column once GET /metrics returns data */}
      <p>{message}</p>
    </section>
  )
}
