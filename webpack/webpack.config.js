var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: ['whatwg-fetch', './webpack/application.js'],
  output: {
    path: './app/assets/javascripts/react',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: { warnings: false }
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000'
      }, {
        test: /\.(svg)$/,
        loader: 'raw-loader'
      }, {
        test: /\.woff$/,
        loader: 'url?limit=100000'
      }, {
        test: /\.scss$/,
        loader: 'style!css!sass'
      }, {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
}
