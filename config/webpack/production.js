const merge = require('webpack-merge')
const environment = require('./environment')

// mapbox-gl can’t be uglified for now, so we won’t...
const fixMapbox = { module: { noParse: /(mapbox-gl)\.js$/ }}

// Our code is open source anyway and I hate debugging otherwise
const sourceMap = { devtool: 'source-map' }

module.exports = merge(environment.toWebpackConfig(), fixMapbox, sourceMap)
