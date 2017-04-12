const { env } = require('../configuration.js')

module.exports = {
  test: /\.jsx?(\.erb)?$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  options: {
    presets: [
      ['es2015', { modules: false }],
      ['env', { modules: false }],
      'react',
    ],
    plugins: [
      ...(env.NODE_ENV === 'development' ? ['react-hot-loader/babel'] : []),
      'transform-class-properties',
      'transform-object-rest-spread',
    ],
  },
}
