import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import yaml from '@rollup/plugin-yaml'
import babel from 'vite-plugin-babel'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))
const javascriptRoot = path.join(root, 'app/javascript')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const packageNames = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
])

const hasIndex = dir =>
  ['index.js', 'index.jsx'].some(f => fs.existsSync(path.join(dir, f)))

// Replicate webpack's `modulePaths: ['app/javascript']`: bare specifiers like
// `shared/orchard`, `redux/actions`, or `Case` resolve under app/javascript.
// Note: `app/javascript/redux` collides with the npm `redux` package — the app
// imports both `redux` (npm) and `redux/reducers` (app). So we alias the `name/`
// subpath form for every directory, but only add the bare `name` form when the
// directory has an index and is NOT also an installed package.
const alias = []
for (const entry of fs.readdirSync(javascriptRoot, { withFileTypes: true })) {
  const full = path.join(javascriptRoot, entry.name)
  if (entry.isDirectory()) {
    alias.push({ find: new RegExp(`^${entry.name}/`), replacement: `${full}/` })
    if (hasIndex(full) && !packageNames.has(entry.name)) {
      alias.push({ find: new RegExp(`^${entry.name}$`), replacement: full })
    }
  } else if (/\.jsx?$/.test(entry.name)) {
    const base = entry.name.replace(/\.jsx?$/, '')
    if (!packageNames.has(base)) {
      alias.push({ find: new RegExp(`^${base}$`), replacement: full })
    }
  }
}

export default defineConfig({
  resolve: {
    alias,
    extensions: ['.js', '.jsx', '.json', '.yml'],
  },
  plugins: [
    yaml(),
    // Use the project's own babel config so transforms match the webpack build
    // (styled-components plugin, preset-react). vite-plugin-babel also handles
    // JSX in `.js` files — many test files and sources use that — which
    // @vitejs/plugin-react does not do by default.
    babel({
      babelConfig: {
        configFile: path.join(root, '.babelrc.js'),
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
    setupFiles: [path.join(root, 'spec/support/vitest-setup.js')],
    include: ['app/javascript/**/__tests__/**/*.test.{js,jsx}'],
    exclude: ['**/node_modules/**'],
    // KNOWN ISSUE: files whose import graph reaches ramda 0.26 fail to collect
    // under Vite 8 / rolldown ("`then` expected a Promise, received function").
    // Tried: inline, optimizeDeps exclude/include, vite-plugin-babel vs
    // @vitejs/plugin-react, Vite 7 pin. Unresolved — see the Phase 4 notes in
    // docs/upgrade-react19-blueprint6-plan.md. Likely needs a ramda bump.
  },
})
