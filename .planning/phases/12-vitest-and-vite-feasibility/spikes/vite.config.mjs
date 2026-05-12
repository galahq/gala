import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'

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
  root,
  publicDir: false,
  resolve: {
    alias: aliases,
    extensions: ['.js', '.jsx', '.json', '.yml', '.scss', '.sass', '.css'],
  },
  server: {
    cors: {
      origin: 'http://localhost:3000',
    },
  },
  plugins: [
    babel({
      babelConfig: {
        configFile: fromRoot('.babelrc.js'),
      },
      filter: /\.[cm]?jsx?$/,
      loader: filePath => (filePath.endsWith('.jsx') ? 'jsx' : 'js'),
    }),
    react({
      jsxRuntime: 'classic',
      fastRefresh: false,
    }),
  ],
  build: {
    outDir: fromRoot('tmp/vite-phase-12'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        styles: fromRoot('app/javascript/packs/styles.js'),
        controllers: fromRoot('app/javascript/packs/controllers.js'),
        catalog: fromRoot('app/javascript/packs/catalog.entry.jsx'),
        case: fromRoot('app/javascript/packs/case.entry.jsx'),
        deployment: fromRoot('app/javascript/packs/deployment.entry.jsx'),
      },
    },
  },
})
