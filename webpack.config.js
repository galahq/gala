module.exports = {
  entry: './app/application.js',
  output: {
    path: './build/',
    filename: 'index.js'
  },
  devServer: {
    inline: true,
    port: 3333
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
        test: /\.(svg|png|jpg)$/,
        loader: 'url?limit=25000'
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
