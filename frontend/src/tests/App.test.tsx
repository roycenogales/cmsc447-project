import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })),
  )
}

test('shows backend connected when health check passes', async () => {
  mockFetch({ status: 'ok', database: 'connected' })
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <App />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Backend: connected')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Upload CSV' })).toBeInTheDocument()
})

test('shows backend unreachable when health check fails', async () => {
  mockFetch({ status: 'error', database: 'unreachable' }, 503)
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <App />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Backend: unreachable')).toBeInTheDocument()
})
