/**
 * @noflow
 * Minimal browser `process` shim for legacy dependencies that still check
 * process.env.NODE_ENV under Webpack 5.
 */

const nodeEnv =
  typeof __GALA_NODE_ENV__ === 'string' ? __GALA_NODE_ENV__ : 'development'

module.exports = {
  env: {
    NODE_ENV: nodeEnv,
  },
}
