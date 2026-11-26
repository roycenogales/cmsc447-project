import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  vi.unstubAllGlobals()
})

type MockRoute = { body: unknown; status?: number }

const LOGIN_OK: MockRoute = { body: { message: 'Hello admin, this is the login route!' } }

// Each call gets a fresh Response, since a Response body can only be read once.
// Login succeeds unless a test overrides '/login/login'.
function mockFetch(routes: Record<string, MockRoute>) {
  const allRoutes: Record<string, MockRoute> = { '/login/login': LOGIN_OK, ...routes }
  const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    const route = allRoutes[path] ?? { body: { detail: 'Not Found' }, status: 404 }
    return Promise.resolve(
      new Response(JSON.stringify(route.body), { status: route.status ?? 200 }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function submitLogin(username: string, password: string) {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

/** Sign in through the login form and wait for the redirect to the upload page. */
async function signIn() {
  renderAt('/login')
  submitLogin('admin', 'secret')
  await screen.findByRole('heading', { name: 'Upload CSV' })
}

test('redirects to login when not signed in', () => {
  mockFetch({})
  renderAt('/upload')

  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Upload CSV' })).not.toBeInTheDocument()
})

test('correct credentials go to the upload page using basic auth', async () => {
  const fetchMock = mockFetch({ '/health': { body: { status: 'ok', database: 'connected' } } })
  await signIn()

  const loginCall = fetchMock.mock.calls.find(([input]) => String(input).endsWith('/login/login'))
  const headers = loginCall?.[1]?.headers as Record<string, string>
  expect(headers.Authorization).toBe(`Basic ${btoa('admin:secret')}`)
  expect(screen.getByText('admin')).toBeInTheDocument()
})

test('wrong credentials show an error and stay on the login page', async () => {
  mockFetch({ '/login/login': { body: { detail: 'Invalid credentials' }, status: 401 } })
  renderAt('/login')
  submitLogin('admin', 'wrong')

  expect(await screen.findByText('Wrong username or password.')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
})

test('sign out returns to the login page', async () => {
  mockFetch({ '/health': { body: { status: 'ok', database: 'connected' } } })
  await signIn()

  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
})

test('shows backend connected when health check passes', async () => {
  mockFetch({ '/health': { body: { status: 'ok', database: 'connected' } } })
  await signIn()

  expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
})

test('shows backend unreachable when health check fails', async () => {
  mockFetch({ '/health': { body: { status: 'error', database: 'unreachable' }, status: 503 } })
  await signIn()

  expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
})

test('shows backend unreachable when health is 200 but database is not connected', async () => {
  mockFetch({ '/health': { body: { status: 'ok', database: 'unreachable' } } })
  await signIn()

  expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
})

test('dashboard shows health and metrics from separate requests', async () => {
  mockFetch({
    '/health': { body: { status: 'ok', database: 'connected' } },
    '/metrics': { body: { detail: 'No metrics found' }, status: 404 },
  })
  await signIn()
  fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

  expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
  expect(await screen.findByText(/No metrics available yet/)).toBeInTheDocument()
})

test('upload shows readable messages for FastAPI validation errors', async () => {
  mockFetch({
    '/health': { body: { status: 'ok', database: 'connected' } },
    '/uploads': {
      body: { detail: [{ loc: ['body', 'file'], msg: 'Field required', type: 'missing' }] },
      status: 422,
    },
  })
  await signIn()

  const file = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' })
  fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } })
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

  expect(await screen.findByText('Field required')).toBeInTheDocument()
})
