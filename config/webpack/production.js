const merge = require('webpack-merge')
const environment = require('./environment')

// mapbox-gl can’t be uglified for now, so we won’t...
const fixMapbox = { module: { noParse: /(mapbox-gl)\.js$/ }}

// Our code is open source anyway and I hate debugging otherwise
const sourceMap = { devtool: 'source-map' }

// Because otherwise it will transform "📷" to "\u{1f4f7}", which is a syntax
// error on... oh, you know, googlebot
environment.plugins.get('UglifyJs').options.uglifyOptions.output.ecma = 5

module.exports = merge(environment.toWebpackConfig(), fixMapbox, sourceMap)
