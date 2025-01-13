/* @flow */
const merge = require('webpack-merge')
const environment = require('./environment')

// While webpacker still defaults to 'cheap-eval-source-map', we need to
// override it because eval is seen as cross-origin, which keeps the errors
// from surfacing
const cheapModuleSourceMap = { devtool: 'cheap-module-source-map' }

module.exports = merge(environment.toWebpackConfig(), cheapModuleSourceMap)
