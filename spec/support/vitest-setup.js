/*  */

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { vi } from 'vitest'

afterEach(() => cleanup())

if (typeof global.MutationObserver === 'undefined') {
  global.MutationObserver = class MutationObserver {
    observe () {}
    disconnect () {}
    takeRecords () { return [] }
  }
}

if (typeof window !== 'undefined' && typeof window.MutationObserver === 'undefined') {
  window.MutationObserver = global.MutationObserver
}

global.vi = vi
