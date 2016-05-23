module.exports = {
  entry: ['whatwg-fetch', './app/application.js'],
  output: {
    path: './public/',
    filename: 'bundle.js'
  },
  devServer: {
    inline: true,
    port: 3333,
    historyApiFallback: true
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
      }
    ]
  }
};
