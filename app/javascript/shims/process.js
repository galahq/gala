/**
 * @noflow
 * Minimal browser `process` shim for legacy dependencies under Webpack 5.
 */
/* global __GALA_NODE_ENV__ */

const nodeEnv =
  typeof __GALA_NODE_ENV__ === 'string' ? __GALA_NODE_ENV__ : 'development'

module.exports = {
  browser: true,
  cwd: () => '/',
  env: {
    NODE_ENV: nodeEnv,
  },
}
