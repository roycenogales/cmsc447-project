import { useEffect, useState } from 'react'
import { getHealth } from '../api/client'

type Status = 'checking' | 'connected' | 'unreachable'

/** Shows whether the backend (and its database) is reachable. */
export default function HealthBadge() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    getHealth()
      .then((health) => setStatus(health.database === 'connected' ? 'connected' : 'unreachable'))
      .catch(() => setStatus('unreachable'))
  }, [])

  return <span className={`health-badge ${status}`}>Backend: {status}</span>
}
