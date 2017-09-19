const webpack = require('webpack')
const { environment } = require('@rails/webpacker')

environment.loaders.delete('file')
environment.loaders.set('svg', {
  test: /\.svg$/,
  loader: 'raw-loader',
})

environment.plugins.set(
  'CommonsChunkVendor',
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => {
      // this assumes your vendor imports exist in the node_modules directory
      return module.context && module.context.indexOf('node_modules') !== -1
    },
  })
)

environment.plugins.set(
  'CommonsChunkManifest',
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity,
  })
)

module.exports = environment
