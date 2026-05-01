/**
 * @noflow
 * Minimal browser global `process` shim for legacy dependencies loaded by
 * lazy chunks or editor-only paths under Webpack 5.
 */
/* global __GALA_NODE_ENV__ */

const nodeEnv =
  typeof __GALA_NODE_ENV__ === 'string' ? __GALA_NODE_ENV__ : 'development'

const processShim = {
  env: {
    NODE_ENV: nodeEnv,
  },
}

const root = typeof globalThis !== 'undefined' ? globalThis : window

if (root.process == null) {
  root.process = processShim
} else {
  root.process.env = {
    ...processShim.env,
    ...root.process.env,
  }
}
