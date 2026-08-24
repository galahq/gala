import { createRequire } from 'node:module'

import { afterEach, describe, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

const require = createRequire(import.meta.url)

// Alias the jest global to Vitest's `vi` so existing tests using jest.fn /
// jest.spyOn / jest.clearAllMocks / jest.resetModules keep working. (Literal
// `jest.mock` calls are converted to `vi.mock` in the test files themselves,
// since only `vi.mock` is hoisted.) Set before requiring jest-fetch-mock so it
// picks up vi.fn.
globalThis.jest = vi

// Jasmine/Jest pending-spec helpers that Vitest does not provide as globals.
globalThis.xdescribe = describe.skip
globalThis.xit = it.skip
globalThis.fdescribe = describe.only
globalThis.fit = it.only

afterEach(cleanup)

// Global fetch mock (jest-fetch-mock uses the jest global set above).
globalThis.fetch = require('jest-fetch-mock')
