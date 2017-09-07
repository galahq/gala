const { environment } = require('@rails/webpacker')

environment.loaders.delete('file')
environment.loaders.set('svg', {
  test: /\.svg$/,
  loader: 'raw-loader',
})

module.exports = environment
