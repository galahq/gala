module.exports = {
  env: {
    development: {
      plugins: ['@babel/plugin-transform-react-jsx-source'],
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: ['babel-plugin-dynamic-import-node'],
    },
  },
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['>0.25%', 'not ie 11', 'not op_mini all'],
        },
        useBuiltIns: 'usage',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],

  plugins: [
    'babel-plugin-styled-components',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-class-properties', { spec: true }],
  ],
}
