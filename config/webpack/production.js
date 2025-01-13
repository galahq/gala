/* @flow */
const merge = require('webpack-merge')
const environment = require('./environment')

// Our code is open source anyway and I hate debugging otherwise
const sourceMap = { devtool: 'source-map' }

module.exports = merge(environment.toWebpackConfig(), sourceMap)
