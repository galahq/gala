/**
 * 
 * Minimal browser global `process` shim for legacy dependencies loaded by
 * lazy chunks or editor-only paths under Webpack 5.
 */

import processShim from './process'

const root = typeof globalThis !== 'undefined' ? globalThis : window

if (root.process == null) {
  root.process = processShim
} else {
  root.process = {
    ...processShim,
    ...root.process,
    env: {
      ...processShim.env,
      ...root.process.env,
    },
    cwd:
      typeof root.process.cwd === 'function'
        ? root.process.cwd
        : processShim.cwd,
  }
}
