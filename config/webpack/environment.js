/**
 * @noflow
 */

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

environment.config.merge({
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: /node_modules/,
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
})

module.exports = environment
