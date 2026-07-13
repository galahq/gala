import path from 'node:path'
import { fileURLToPath } from 'node:url'

import babel from 'vite-plugin-babel'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')
const fromRoot = (...parts) => path.resolve(root, ...parts)

const javascriptRoot = fromRoot('app/javascript')
const aliasNames = [
  'card',
  'catalog',
  'comments',
  'conversation',
  'deployment',
  'deprecated',
  'draft',
  'edgenotes',
  'elements',
  'images',
  'magic_link',
  'map_view',
  'overview',
  'page',
  'podcast',
  'quiz',
  'reading_list',
  'redux',
  'shared',
  'shims',
  'stats',
  'suggested_quizzes',
  'table_of_contents',
  'utility',
  'wikidata',
]

const aliases = [
  ...aliasNames.map(name => ({
    find: new RegExp(`^${name}/`),
    replacement: `${path.join(javascriptRoot, name)}/`,
  })),
  { find: /^catalog$/, replacement: path.join(javascriptRoot, 'catalog') },
  { find: /^deployment$/, replacement: path.join(javascriptRoot, 'deployment') },
  { find: /^Case$/, replacement: path.join(javascriptRoot, 'Case.jsx') },
]

export default defineConfig({
  resolve: {
    alias: aliases,
    extensions: ['.js', '.jsx', '.json', '.yml', '.scss', '.sass', '.css'],
  },
  plugins: [
    babel({
      babelConfig: {
        configFile: fromRoot('.babelrc.js'),
        envName: 'development',
      },
      include: /app\/javascript/,
      filter: /\.[cm]?jsx?($|\?)/,
      loader: filePath => (filePath.endsWith('.jsx') ? 'jsx' : 'js'),
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [fromRoot('.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.setup.js')],
    include: [
      fromRoot('app/javascript/shared/__tests__/functions.test.js'),
      fromRoot('app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js'),
      fromRoot('app/javascript/stats/__tests__/DatePicker.test.jsx'),
      fromRoot('app/javascript/redux/reducers/__tests__/cards.test.js'),
    ],
  },
})
