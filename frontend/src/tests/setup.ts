import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest runs without `globals: true`, so Testing Library can't register its
// automatic cleanup. Unmount after each test so renders don't pile up in the DOM.
afterEach(() => {
  cleanup()
})
