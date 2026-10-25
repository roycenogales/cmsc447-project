import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  vi.unstubAllGlobals()
})

type MockRoute = { body: unknown; status?: number }

// Each call gets a fresh Response, since a Response body can only be read once.
function mockFetch(routes: Record<string, MockRoute>) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const path = new URL(String(input)).pathname
    const route = routes[path] ?? { body: { detail: 'Not Found' }, status: 404 }
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

test('shows backend connected when health check passes', async () => {
  mockFetch({ '/health': { body: { status: 'ok', database: 'connected' } } })
  renderAt('/upload')

  expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Upload CSV' })).toBeInTheDocument()
})

test('shows backend unreachable when health check fails', async () => {
  mockFetch({ '/health': { body: { status: 'error', database: 'unreachable' }, status: 503 } })
  renderAt('/upload')

  expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
})

test('shows backend unreachable when health is 200 but database is not connected', async () => {
  mockFetch({ '/health': { body: { status: 'ok', database: 'unreachable' } } })
  renderAt('/upload')

  expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
})

test('dashboard shows health and metrics from separate requests', async () => {
  mockFetch({
    '/health': { body: { status: 'ok', database: 'connected' } },
    '/metrics': { body: { detail: 'Metrics not implemented yet' }, status: 501 },
  })
  renderAt('/')

  expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
  expect(await screen.findByText('Metrics not implemented yet')).toBeInTheDocument()
})

test('upload shows readable messages for FastAPI validation errors', async () => {
  mockFetch({
    '/health': { body: { status: 'ok', database: 'connected' } },
    '/uploads': {
      body: { detail: [{ loc: ['body', 'file'], msg: 'Field required', type: 'missing' }] },
      status: 422,
    },
  })
  renderAt('/upload')

  const file = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' })
  fireEvent.change(screen.getByLabelText('CSV file'), { target: { files: [file] } })
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

  expect(await screen.findByText('Field required')).toBeInTheDocument()
})
