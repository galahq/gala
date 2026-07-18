/**
 *
 */

const { generateWebpackConfig } = require('shakapacker')
const webpack = require('webpack')
const { merge } = require('webpack-merge')

const webpackConfig = generateWebpackConfig()
const nodeEnv = process.env.NODE_ENV || 'development'

const manifestPlugin = webpackConfig.plugins.find(
  (plugin) =>
    plugin.constructor &&
    plugin.constructor.name === 'WebpackAssetsManifest'
)

if (manifestPlugin && manifestPlugin.options) {
  // Avoid stale entrypoint chunks after splitChunks changes. When the manifest
  // preserves old chunk names, the Docker dev server can proxy 404s for those
  // scripts before Stimulus mounts stats/date-picker/map views.
  manifestPlugin.options.merge = false
}

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
      outputStyle: nodeEnv === 'production' ? 'compressed' : 'expanded',
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
    // process.env.NODE_ENV, so inline that value and provide a tiny local
    // process object for lazy chunks that reference process directly.
    new webpack.DefinePlugin({
      __GALA_NODE_ENV__: JSON.stringify(nodeEnv),
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('../../app/javascript/shims/process'),
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
