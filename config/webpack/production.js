const merge = require('webpack-merge')
const environment = require('./environment')

// mapbox-gl can’t be uglified for now, so we won’t...
const fixMapbox = { module: { noParse: /(mapbox-gl)\.js$/ }}

module.exports = merge(environment.toWebpackConfig(), fixMapbox)
