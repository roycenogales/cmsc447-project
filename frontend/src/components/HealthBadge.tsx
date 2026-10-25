import { useEffect, useState } from 'react'
import { getHealth, isAbortError } from '../api/client'

type Status = 'checking' | 'connected' | 'unreachable'

const POLL_INTERVAL_MS = 15_000

/** Shows whether the backend (and its database) is reachable. Re-checks periodically. */
export default function HealthBadge() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const controller = new AbortController()

    function check() {
      getHealth(controller.signal)
        .then((health) => setStatus(health.database === 'connected' ? 'connected' : 'unreachable'))
        .catch((error) => {
          if (!isAbortError(error)) setStatus('unreachable')
        })
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      clearInterval(interval)
      controller.abort()
    }
  }, [])

  return <span className={`health-badge ${status}`}>Backend: {status}</span>
}
