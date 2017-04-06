var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'eval',

  entry: {
    "case": ['babel-polyfill', 'whatwg-fetch', 'case.entry.jsx'],
    //edgenote: ['whatwg-fetch', 'edgenote.entry.jsx'],
    enrollments: ['babel-polyfill', 'whatwg-fetch', 'enrollments.entry.jsx'],
    dashboard: ['babel-polyfill', 'whatwg-fetch', 'dashboard.entry.jsx'],
  },

  output: {
    path: './app/assets/javascripts/react',
    filename: '[name].bundle.js',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],

  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: [
      path.resolve('./app/components'),
      path.resolve('./config/locales/react'),
      path.resolve('./app/assets/images/react'),
    ],
  },

  module: {
    loaders: [
      {
        exclude: /node_modules\/(?!(react-animate)\/.*)/,
        test: /\.jsx?$/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react', 'stage-3'],
          plugins: ["transform-object-rest-spread"],
        },
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000',
      }, {
        test: /\.(svg)$/,
        loader: 'raw-loader',
      }, {
        test: /\.woff$/,
        loader: 'url?limit=100000',
      }, {
        test: /\.scss$/,
        loader: 'style!css!sass',
      }, {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
}
