const webpack = require('webpack')
const { environment } = require('@rails/webpacker')

environment.loaders.get(
  'file'
).test = /\.(jpg|jpeg|png|gif|eot|otf|ttf|woff|woff2)$/i

environment.loaders.append('svg', {
  test: /\.svg$/,
  loader: 'raw-loader',
})
environment.loaders.append('yaml', {
  test: /\.yaml$|\.yml$/,
  use: [{ loader: 'json-loader' }, { loader: 'yaml-loader' }],
})

environment.plugins.append(
  'CommonsChunkVendor',
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => {
      // this assumes your vendor imports exist in the node_modules directory
      return module.context && module.context.indexOf('node_modules') !== -1
    },
  })
)

environment.plugins.append(
  'CommonsChunkManifest',
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity,
  })
)

module.exports = environment
