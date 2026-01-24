/**
 * @noflow
 */

const { environment } = require('@rails/webpacker')
const { flatten } = require('ramda')

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin
//
// environment.plugins.append('BundleAnalyzer', new BundleAnalyzerPlugin())

const nodeModules = environment.loaders.get('nodeModules')
nodeModules.exclude = flatten([nodeModules.exclude, /mapbox-gl/])

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
          // Only split JS from node_modules, not CSS
          test: /[\\/]node_modules[\\/].*\.jsx?$/,
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
})

module.exports = environment
