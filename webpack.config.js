const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const root = __dirname
const packsPath = path.resolve(root, 'app/javascript/packs')

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry: {
      billboard: path.resolve(packsPath, 'billboard.entry.jsx'),
      case: path.resolve(packsPath, 'case.entry.jsx'),
      catalog: path.resolve(packsPath, 'catalog.entry.jsx'),
      controllers: path.resolve(packsPath, 'controllers.js'),
      deployment: path.resolve(packsPath, 'deployment.entry.jsx'),
      file_upload: path.resolve(packsPath, 'file_upload.js'),
      'main-menu': path.resolve(packsPath, 'main-menu.entry.jsx'),
      onboarding: path.resolve(packsPath, 'onboarding.js'),
      styles: path.resolve(packsPath, 'styles.js'),
    },
    output: {
      filename: '[name].js',
      path: path.resolve(root, 'app/assets/builds'),
      publicPath: '/assets/',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.scss', '.css', '.yaml', '.yml'],
      modules: [path.resolve(root, 'app/javascript'), 'node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules\/(?!mapbox-gl)/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|eot|otf|ttf|woff|woff2)$/i,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash].[ext]',
            },
          },
        },
        {
          test: /\.svg$/,
          use: 'raw-loader',
        },
        {
          test: /\.ya?ml$/,
          use: [{ loader: 'json-loader' }, { loader: 'yaml-loader' }],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            name: 'vendor',
            test: /[\\/]node_modules[\\/].*\.jsx?$/,
            enforce: true,
          },
        },
      },
      runtimeChunk: 'single',
    },
  }
}
