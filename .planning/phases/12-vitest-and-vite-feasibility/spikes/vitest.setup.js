import { createRequire } from 'node:module'

import { afterEach, expect, vi } from 'vitest'

const require = createRequire(import.meta.url)

globalThis.expect = expect
globalThis.jest = vi

require('jest-dom/extend-expect')

const { cleanup } = require('react-testing-library')
afterEach(cleanup)

globalThis.fetch = require('jest-fetch-mock')
