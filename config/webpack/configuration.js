// Common configuration for webpacker loaded from config/webpack/paths.yml

const { join, resolve } = require('path')
const { env } = require('process')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')

const configPath = resolve('config', 'webpack')
const loadersDir = join(__dirname, 'loaders')
const paths = safeLoad(readFileSync(join(configPath, 'paths.yml'), 'utf8'))[
  env.NODE_ENV
]
const devServer = safeLoad(
  readFileSync(join(configPath, 'development.server.yml'), 'utf8')
)[env.NODE_ENV]

const devPublicPath = env.LOCALHOST_SSL
  ? `https://localhost:${devServer.port}/`
  : `http://${devServer.host}:${devServer.port}/`

const publicPath = env.NODE_ENV !== 'production' && devServer.enabled
  ? devPublicPath
  : `/${paths.entry}/`

const devServerEntries = env.NODE_ENV !== 'production' && devServer.enabled
  ? [
    'react-hot-loader/patch',
    `webpack-dev-server/client?${publicPath}`,
    'webpack/hot/only-dev-server',
  ]
  : []

const pluginEntries = [...devServerEntries, 'babel-polyfill', 'whatwg-fetch']

module.exports = {
  devServer,
  env,
  paths,
  loadersDir,
  publicPath,
  pluginEntries,
}
