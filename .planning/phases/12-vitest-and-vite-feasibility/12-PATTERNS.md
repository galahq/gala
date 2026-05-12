# Phase 12: Vitest and Vite Feasibility - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 12
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | package-resolution / command-exec | `package.json` | exact-current-state |
| `jest.config.js` | config | transform / test-runner | `jest.config.js` | exact-current-state |
| `vitest.config.*` | config | transform / test-runner | `jest.config.js`, `spec/support/jest-setup.js` | role-match |
| `spec/support/jest-setup.js` or new Vitest setup file | config | test-environment | `spec/support/jest-setup.js` | exact-current-state |
| `vite.config.*` | config | build-config | `config/shakapacker.yml`, `config/webpack/environment.js` | role-match |
| `config/shakapacker.yml` | config | build-config | `config/shakapacker.yml` | exact-current-state |
| `config/webpack/environment.js` | config | build-config / asset-transform | `config/webpack/environment.js` | exact-current-state |
| `app/javascript/packs/*.entry.jsx` | route | request-response / mount | `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx` | exact-current-state |
| `app/javascript/packs/styles.js` | route | CSS import / side-effect | `app/javascript/packs/styles.js` | exact-current-state |
| `app/assets/stylesheets/application.css` | config | CSS import / asset-pipeline | `app/assets/stylesheets/application.css` | exact-current-state |
| `app/javascript/shared/blueprintLegacyNamespace.js` | utility | DOM mutation / compatibility | `app/javascript/shared/blueprintLegacyNamespace.js` | exact-current-state |
| `12-RESEARCH.md` / decision summary | documentation | feasibility-decision | `.planning/phases/11-pnpm-package-manager-migration/*-SUMMARY.md` | role-match |

## Pattern Assignments

### `package.json` (config, package-resolution / command-exec)

**Analog:** `package.json`

**pnpm and test script pattern** (lines 12-19):
```json
"packageManager": "pnpm@11.1.0",
"scripts": {
  "test": "NODE_ENV=test jest app/javascript"
},
"engines": {
  "node": ">=24 <25",
  "pnpm": "11.1.0"
}
```

**Compatibility hold pattern** (lines 29-33, 68-75, 99-108, 118-139):
```json
"@babel/preset-flow": "^7.0.0",
"@blueprintjs/core": "4.20.2",
"@blueprintjs/datetime": "4.4.37",
"@blueprintjs/select": "4.3.1",
"react": "^16.8.6",
"react-dom": "^16.8.6",
"shakapacker": "10.0.0",
"webpack": "5.106.1",
"babel-jest": "^24.5.0",
"jest": "^24.5.0",
"react-testing-library": "^6.0.0",
"style-loader": "3.3.4"
```

**Planner copy instruction:** Any Vitest/Vite spike should add only the minimum scripts/dependencies needed for feasibility. Preserve React 16, BlueprintJS 4, Shakapacker 10, Webpack 5, and Flow parsing until later phases explicitly own those migrations.

---

### `jest.config.js` / `vitest.config.*` (config, transform / test-runner)

**Analog:** `jest.config.js`

**Current Jest runner pattern** (lines 3-14):
```javascript
module.exports = {
  modulePathIgnorePatterns: [
    '<rootDir>/vendor/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'yml'],
  modulePaths: ['<rootDir>/app/javascript'],
  setupFilesAfterEnv: ['<rootDir>/spec/support/jest-setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.ya?ml?$': 'yaml-jest',
  },
}
```

**Planner copy instruction:** A Vitest config must prove equivalents for `app/javascript` absolute imports, `.js/.jsx/.json/.yml` resolution, setup file loading, Babel/Flow/JSX parsing, and YAML imports. Do not remove Jest config in Phase 12 unless the spike is explicitly reversible and documented.

---

### `spec/support/jest-setup.js` or Vitest setup file (config, test-environment)

**Analog:** `spec/support/jest-setup.js`

**React 16 test environment pattern** (lines 1-6):
```javascript
/* @flow */

require('jest-dom/extend-expect')
require('react-testing-library/cleanup-after-each')

global.fetch = require('jest-fetch-mock')
```

**Planner copy instruction:** Vitest setup must reproduce jest-dom matchers, React Testing Library cleanup behavior for the old `react-testing-library` package, and global fetch mocking. If Vitest uses `vi`, document every Jest global compatibility shim required by representative tests.

---

### `config/shakapacker.yml` / `vite.config.*` (config, build-config)

**Analog:** `config/shakapacker.yml`

**Rails entrypoint and extension pattern** (lines 3-18, 23-38):
```yaml
default: &default
  source_path: app/javascript
  source_entry_path: packs
  nested_entries: false
  public_root_path: public
  public_output_path: packs
  cache_path: tmp/cache/shakapacker
  webpack_compile_output: true
  shakapacker_precompile: true
  javascript_transpiler: "babel"
  assets_bundler: "webpack"
  ensure_consistent_versioning: true
  additional_paths: []
  extensions:
    - .js
    - .jsx
    - .sass
    - .scss
    - .css
    - .png
    - .svg
```

**Environment behavior pattern** (lines 39-68):
```yaml
development:
  <<: *default
  compile: true
  dev_server:
    host: 0.0.0.0
    port: 3035
    hmr: true
    allowed_hosts:
      - localhost
      - host.docker.internal

test:
  <<: *default
  compile: true
  public_output_path: packs-test

production:
  <<: *default
  compile: false
  cache_manifest: true
```

**Planner copy instruction:** Vite feasibility must compare against these Rails integration semantics: source path `app/javascript`, pack entry directory `packs`, test output isolation, production precompile requirement, and dev-server host allowances used by browser QA.

---

### `config/webpack/environment.js` / `vite.config.*` (config, build-config / asset-transform)

**Analog:** `config/webpack/environment.js`

**Shakapacker-generated config extension pattern** (lines 5-23, 60-84):
```javascript
const { generateWebpackConfig } = require('shakapacker')
const webpack = require('webpack')
const { merge } = require('webpack-merge')

const webpackConfig = generateWebpackConfig()
const nodeEnv = process.env.NODE_ENV || 'development'

const manifestPlugin = webpackConfig.plugins.find(
  (plugin) =>
    plugin.constructor &&
    plugin.constructor.name === 'WebpackAssetsManifest'
)

if (manifestPlugin && manifestPlugin.options) {
  manifestPlugin.options.merge = false
}

module.exports = merge(webpackConfig, {
  plugins: [
    new webpack.DefinePlugin({
      __GALA_NODE_ENV__: JSON.stringify(nodeEnv),
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('../../app/javascript/shims/process'),
    }),
  ],
  resolve: {
    extensions: [
      ...webpackConfig.resolve.extensions,
      '.scss',
      '.sass',
      '.css',
    ],
```

**Loader and splitting pattern** (lines 30-58, 85-110):
```javascript
const fileRule = webpackConfig.module.rules.find(
  (rule) => rule.type === 'asset/resource'
)
const sassRule = webpackConfig.module.rules.find((rule) =>
  String(rule.test).includes('scss')
)

if (fileRule) {
  fileRule.test = /\.(jpg|jpeg|png|gif|eot|otf|ttf|woff|woff2)$/i
}

module: {
  rules: [
    {
      test: /\.svg$/,
      use: [{ loader: 'raw-loader', options: { esModule: false } }],
    },
    {
      test: /\.yaml$|\.yml$/,
      use: [{ loader: 'json-loader' }, { loader: 'yaml-loader' }],
    },
  ],
},
optimization: {
  splitChunks: {
    cacheGroups: {
      vendor: {
        chunks: 'initial',
        name: 'vendor',
        test: /[\\/]node_modules[\\/].*\.jsx?$/,
```

**Planner copy instruction:** Vite spike must explicitly test `process.env.NODE_ENV`, local process shim needs, `path-browserify`, Sass output, YAML imports, raw SVG string imports via `require('images/*.svg')`, image/font asset handling, and vendor/runtime chunk assumptions.

---

### `app/javascript/packs/*.entry.jsx` (route, request-response / mount)

**Analogs:** `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/main-menu.entry.jsx`

**React island mount pattern** (`case.entry.jsx` lines 5-25, 27-52):
```javascript
import 'shims/installProcess'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { theme } from 'utility/styledComponents'
import { addLocaleData, IntlProvider } from 'react-intl'
import Case from 'Case'
import ErrorBoundary from 'utility/ErrorBoundary'
import reducer from 'redux/reducers'
import loadMessages from '../../../config/locales'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(enableBatching(reducer), composeEnhancers(applyMiddleware(thunk)))
const { locale } = (window.i18n: { locale: string })

Promise.all([
  import(`react-intl/locale-data/${locale.substring(0, 2)}`),
  loadMessages(locale),
]).then(([localeData, messages]) => {
  addLocaleData(localeData.default)
  ReactDOM.render(/* providers */, document.getElementById('container'))
})
```

**Stimulus pack pattern** (`controllers.js` lines 5-10):
```javascript
import { Application } from 'stimulus'
import { definitionsFromContext } from 'stimulus/webpack-helpers'

const application = Application.start()
const context = require.context('../controllers', true, /\.js$/)
application.load(definitionsFromContext(context))
```

**Planner copy instruction:** Vite feasibility must test React 16 `ReactDOM.render`, Flow syntax in entrypoints, `app/javascript` absolute imports, dynamic locale imports, Rails-provided `window.i18n`, Redux/styled-components providers, and Webpack-only `require.context` in the Stimulus pack.

---

### `app/javascript/packs/styles.js` and `app/assets/stylesheets/application.css` (CSS import / asset-pipeline)

**Analogs:** `app/javascript/packs/styles.js`, `app/assets/stylesheets/application.css`, `app/views/layouts/application.html.erb`

**Shakapacker styles side-effect pattern** (`styles.js` lines 5-10):
```javascript
import 'shared/blueprint'
import 'shared/blueprintLegacyNamespace'
import 'shared/galaTypography'

import { FocusStyleManager } from '@blueprintjs/core'
FocusStyleManager.onlyShowFocusOnTabs()
```

**Sprockets Blueprint package CSS ownership pattern** (`application.css` lines 13-21):
```css
*= require @blueprintjs/icons/lib/css/blueprint-icons
*= require @blueprintjs/core/lib/css/blueprint
*= require @blueprintjs/datetime/lib/css/blueprint-datetime
*= require @blueprintjs/popover2/lib/css/blueprint-popover2
*= require @blueprintjs/select/lib/css/blueprint-select
*= require axioms
*= require_tree .
*= require_self
*= stub print
```

**Global layout order pattern** (`application.html.erb` lines 30-33):
```erb
<%= collected_javascript_pack_tag 'styles', 'controllers', 'onboarding' %>
<%= collected_stylesheet_pack_tag 'styles' %>
<%= stylesheet_link_tag 'application', media: 'all' %>
<%= render 'application/fonts' %>
```

**Planner copy instruction:** Do not move Blueprint package CSS into Vite/Shakapacker styles during Phase 12. The spike should preserve current global order: styles JS side effects, optional styles pack CSS, then Sprockets `application.css`.

---

### Static asset handling (file-I/O / asset-transform)

**Analogs:** `config/initializers/assets.rb`, `app/javascript/utility/Icon.jsx`, `app/javascript/overview/keywords/KeywordsDisplay.jsx`, `app/javascript/map_view/Pin.jsx`

**Rails asset path and Blueprint icon font pattern** (`assets.rb` lines 10-29):
```ruby
Rails.application.config.assets.paths << Rails.root.join('node_modules')
Rails.application.config.assets.paths << Rails.root.join(
  'node_modules/@blueprintjs/icons/lib/css'
)

Rails.application.config.assets.precompile += %w[
  print.css
  blueprint-icons-16.eot
  blueprint-icons-16.ttf
  blueprint-icons-16.woff
  blueprint-icons-16.woff2
  blueprint-icons-20.eot
  blueprint-icons-20.ttf
  blueprint-icons-20.woff
  blueprint-icons-20.woff2
]
```

**Webpack raw/dynamic asset require patterns** (`Icon.jsx` lines 11-19, `KeywordsDisplay.jsx` lines 47-49, `Pin.jsx` lines 62-64):
```javascript
const Icon = ({ filename, ...props }: Props) => (
  <span dangerouslySetInnerHTML={{ __html: require(`images/${filename}.svg`) }} {...props} />
)

const CategoryTag = styled.a.attrs({ className: 'pt-tag pt-large' })`
  background-image: url(${p => require(`images/category-${p.category}.jpg`)});
`

const PinIcon = styled.span.attrs({
  dangerouslySetInnerHTML: { __html: require('images/pin.svg') },
})``
```

**Planner copy instruction:** Vite feasibility must check Blueprint icon font serving from `node_modules`, Sprockets precompile of icon font files, raw SVG `dangerouslySetInnerHTML` imports, dynamic image requires, and CSS `url()` behavior in styled-components.

---

### `app/javascript/shared/blueprintLegacyNamespace.js` (utility, DOM mutation / compatibility)

**Analog:** `app/javascript/shared/blueprintLegacyNamespace.js`

**Legacy class bridge pattern** (lines 10-33, 42-76):
```javascript
const LEGACY_NAMESPACE = 'pt-'
const BLUEPRINT_NAMESPACE = 'bp4-'
const RAILS_RENDERED_LEGACY_SELECTOR = '.Toolbar__bar, .window-admin, .window.admin'

function mirrorLegacyClasses(node) {
  if (!(node instanceof Element)) return
  if (isRailsRenderedLegacyElement(node)) return

  const mappedBlueprintClasses = Array.from(node.classList)
    .filter(className => className.startsWith(LEGACY_NAMESPACE))
    .map(className =>
      className.replace(LEGACY_NAMESPACE, BLUEPRINT_NAMESPACE)
    )
    .filter(mappedClassName => !node.classList.contains(mappedClassName))

  if (mappedBlueprintClasses.length > 0) node.classList.add(...mappedBlueprintClasses)
}

function observeLegacyClassChanges() {
  const Observer =
    typeof MutationObserver !== 'undefined'
      ? MutationObserver
      : typeof window !== 'undefined'
        ? window.MutationObserver
        : undefined

  if (typeof Observer === 'undefined') return
  const observer = new Observer(mutations => { /* mirror changes */ })
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true,
  })
}
```

**Planner copy instruction:** Vitest and Vite spikes must preserve this side-effect module behavior. This file is currently dirty in the worktree, so implementation plans should read the live file and avoid overwriting user changes.

---

### Representative frontend tests (test, transform / jsdom / DOM)

**Analogs:** `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/stats/__tests__/DatePicker.test.jsx`, `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`, `app/javascript/shared/__tests__/blueprintAssetContract.test.js`

**Container component test pattern** (`StatsPage.test.jsx` lines 8-14, 113-130, 145-171):
```javascript
const mockFetchStats = jest.fn()
const mockFetchWithTimeout = jest.fn((promise) => promise)

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
  fetchWithTimeout: (...args) => mockFetchWithTimeout(...args),
}))

function renderPage (props = {}) {
  return render(
    <IntlProvider locale="en" messages={messages}>
      <StatsPage dataUrl="/cases/demo/stats" minDate="2020-01-01" {...props} />
    </IntlProvider>
  )
}

expect(view.getByTestId('page-loading')).toBeTruthy()
await waitForElement(() => view.getByTestId('stats-summary'))
expect(mockFetchStats).toHaveBeenCalledTimes(1)
```

**Third-party Blueprint mock pattern** (`DatePicker.test.jsx` lines 7-31, 61-83):
```javascript
import { DateRangePicker } from '@blueprintjs/datetime'

jest.mock('@blueprintjs/datetime', () => {
  const React = require('react')
  return {
    DateRangePicker: jest.fn((props) => (
      <div className="bp4-daterangepicker">
        <div className="bp4-daterangepicker-shortcuts">
          {(props.shortcuts || []).map((shortcut, index) => (
            <button type="button" className="bp4-menu-item" data-testid={`shortcut-${index}`} key={shortcut.label}>
              {shortcut.label}
            </button>
          ))}
        </div>
      </div>
    )),
  }
})

await waitForElement(() => {
  const shortcut = getByTestId('shortcut-0')
  if (!shortcut.classList.contains('bp4-active')) throw new Error('shortcut is not active yet')
  return shortcut
})
```

**DOM side-effect module pattern** (`blueprintLegacyNamespace.test.js` lines 5-19, 21-38, 67-93):
```javascript
const loadBridge = () => {
  jest.resetModules()
  require(bridgePath)
}

global.MutationObserver = jest.fn(function MutationObserverMock(observer) {
  callback = observer
  this.observe = jest.fn()
})

document.body.innerHTML = '<button class="pt-button pt-intent-primary">Save</button>'
loadBridge()
expect(button.classList.contains('bp4-button')).toBe(true)
```

**Asset contract test pattern** (`blueprintAssetContract.test.js` lines 3-15, 42-75):
```javascript
const fs = require('fs')
const path = require('path')

const readSource = relativePath =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

expect(source).toEqual(expect.stringContaining("import 'shared/blueprint'"))
expect(source).not.toMatch(/@blueprintjs\/[^'"]+\/lib\/css/)
expect(sprocketsStylesheetIndex).toBeGreaterThan(stylesheetPackIndex)
```

**Planner copy instruction:** Use these as the representative Vitest spike set because together they cover Jest globals, module mocks, resetModules/CommonJS require, jsdom DOM mutation, React 16 rendering, old React Testing Library APIs, filesystem contract tests, Blueprint mocks, and async behavior.

---

### `12-RESEARCH.md` / decision summary (documentation, feasibility-decision)

**Analogs:** `.planning/phases/11-pnpm-package-manager-migration/11-01-SUMMARY.md`, `.planning/phases/11-pnpm-package-manager-migration/11-02-SUMMARY.md`

**Decision evidence summary pattern** (`11-01-SUMMARY.md` lines 10-17, 25-35):
```markdown
## Changes

- Replaced root `packageManager` from `yarn@1.22.22` to `pnpm@11.1.0`.
- Generated `pnpm-lock.yaml` from the current `yarn.lock` with `pnpm import`.

## Verification

- `pnpm install --frozen-lockfile` passed locally.
- `pnpm test -- --runInBand` passed locally: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped.
- `bundle exec rails assets:precompile` passed in the running Docker dev container with Ruby 4.0.3.

## Notes
```

**Planner copy instruction:** Phase 12 outputs should separate spike changes, verification commands, concrete blockers, and final decision. The decision can be negative for Vite if blockers are specific and Shakapacker/Webpack retention is documented.

## Shared Patterns

### pnpm-Backed Verification

**Source:** `package.json` lines 12-19; Phase 11 summaries.
**Apply to:** all Phase 12 JavaScript spike commands.

```bash
pnpm install --frozen-lockfile
pnpm test -- --runInBand
```

Phase 11 proved current Jest parity under pnpm: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped. Use pnpm for any Vitest/Vite add/run commands.

### Shakapacker/Webpack Is the Baseline Production Bundler

**Source:** `config/shakapacker.yml`, `config/webpack/environment.js`, `app/views/layouts/application.html.erb`.
**Apply to:** Vite feasibility and decision docs.

```yaml
assets_bundler: "webpack"
shakapacker_precompile: true
production:
  compile: false
```

Vite replacement must be proven against Rails pack helpers, manifest behavior, production precompile, asset/font handling, and global layout order before it can replace this baseline.

### Blueprint Compatibility Ownership

**Source:** `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js`, `app/javascript/shared/__tests__/blueprintAssetContract.test.js`.
**Apply to:** Vitest/Vite spikes and any package/build config edits.

```javascript
import 'shared/blueprint'
import 'shared/blueprintLegacyNamespace'
import 'shared/galaTypography'
```

```css
*= require @blueprintjs/core/lib/css/blueprint
*= require @blueprintjs/datetime/lib/css/blueprint-datetime
*= require @blueprintjs/select/lib/css/blueprint-select
```

Do not duplicate Blueprint package CSS in JS packs. Keep package CSS in Sprockets and local compatibility overrides in the styles pack.

### Dirty Worktree Protection

**Source:** `git status --short`.
**Apply to:** `app/javascript/shared/blueprint.scss`, `app/javascript/shared/blueprintLegacyNamespace.js`, `app/javascript/stats/__tests__/DatePicker.test.jsx`, and `app/javascript/catalog/search_results/NoSearchResults.jsx`.

```text
 M app/javascript/catalog/search_results/NoSearchResults.jsx
 M app/javascript/shared/blueprint.scss
 M app/javascript/shared/blueprintLegacyNamespace.js
 M app/javascript/stats/__tests__/DatePicker.test.jsx
```

Planner should require implementers to read current live contents before touching these files and preserve unrelated user changes.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| None | - | - | Every expected Phase 12 file has a current-state analog. New Vitest/Vite config files should copy from Jest and Shakapacker/Webpack analogs above. |

## Metadata

**Analog search scope:** root package/test config, `spec/support`, `config/shakapacker.yml`, `config/webpack`, `app/javascript/packs`, Sprockets CSS manifests, Blueprint compatibility files, representative frontend tests, Phase 11 summaries.
**Files scanned:** 40+ targeted files plus `.planning/codebase` testing/stack docs.
**Pattern extraction date:** 2026-05-12
**Worktree note:** Four frontend files were dirty during mapping; source files were not modified.
