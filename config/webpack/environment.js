/**
 * @noflow
 */

const { generateWebpackConfig } = require('shakapacker')
const webpack = require('webpack')
const { merge } = require('webpack-merge')

const webpackConfig = generateWebpackConfig()

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin
//
// environment.plugins.append('BundleAnalyzer', new BundleAnalyzerPlugin())

const fileRule = webpackConfig.module.rules.find(
  (rule) => rule.type === 'asset/resource'
)

const sassRule = webpackConfig.module.rules.find((rule) =>
  String(rule.test).includes('scss')
)

if (sassRule) {
  const sassLoader = sassRule.use.find(
    (entry) =>
      typeof entry === 'object' &&
      entry.loader &&
      entry.loader.includes('sass-loader')
  )

  if (sassLoader) {
    sassLoader.options = sassLoader.options || {}
    sassLoader.options.implementation = require('sass')
    sassLoader.options.sassOptions = {
      ...(sassLoader.options.sassOptions || {}),
      outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
    }
  }
}

if (fileRule) {
  fileRule.test = /\.(jpg|jpeg|png|gif|eot|otf|ttf|woff|woff2)$/i
}

module.exports = merge(webpackConfig, {
  plugins: [
    // Webpack 5 no longer injects Node's `process` global. Some legacy
    // browser dependencies still guard development-only code with
    // process.env.NODE_ENV, so inline that value at compile time.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),
  ],
  resolve: {
    extensions: [
      ...webpackConfig.resolve.extensions,
      '.scss',
      '.sass',
      '.css',
    ],
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [{ loader: 'raw-loader', options: { esModule: false } }],
      },
      {
        test: /\.yaml$|\.yml$/,
        use: [{ loader: 'json-loader' }, { loader: 'yaml-loader' }],
      },
    ],
  },
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
