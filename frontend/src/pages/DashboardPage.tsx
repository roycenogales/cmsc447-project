import { useEffect, useState } from 'react'
import { getMetrics } from '../api/client'

/** Placeholder for the weekly metrics visualization. */
export default function DashboardPage() {
  const [message, setMessage] = useState('Loading metrics...')

  useEffect(() => {
    getMetrics()
      .then((data) => setMessage(data.detail))
      .catch((error: Error) => setMessage(error.message))
  }, [])

  return (
    <section>
      <h2>Dashboard</h2>
      {/* TODO: render a chart of the selected column once GET /metrics returns data */}
      <p>{message}</p>
    </section>
  )
}
