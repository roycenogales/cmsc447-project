import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, login } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import UmbcLogo from '../components/UmbcLogo'
import './LoginPage.css'

/** Sign-in form. Correct credentials go to the upload page; wrong ones stay here. */
export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setError('')

    try {
      await login(username, password)
      signIn(username)
      navigate('/upload', { replace: true })
    } catch (caught: unknown) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError('Wrong username or password.')
      } else if (caught instanceof ApiError) {
        setError(`Login failed (${caught.status}): ${caught.message}`)
      } else {
        // fetch itself throws (TypeError) when the backend is down
        setError('Could not reach the server. Is the backend running?')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="brand">
          <UmbcLogo />
          Retriever Essentials Dashboard
        </h1>
        <h2>Sign in</h2>

        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            disabled={submitting}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        {error && (
          <p role="alert" className="login-error">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
