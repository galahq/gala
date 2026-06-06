/*  */

const fs = require('fs')
const path = require('path')

const readSource = relativePath =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('Blueprint asset ownership contract', () => {
  const applicationCss = () =>
    readSource('app/assets/stylesheets/application.sass')
  const applicationJs = () => readSource('app/javascript/application.js')
  const applicationLayout = () =>
    readSource('app/views/layouts/application.html.erb')
  const axiomsScss = () => readSource('app/assets/stylesheets/axioms.scss')
  const packageJson = () => readSource('package.json')
  const blueprintFormBuilder = () =>
    readSource('app/helpers/blueprint_form_builder.rb')
  const applicationHelper = () => readSource('app/helpers/application_helper.rb')
  const digestCssBuilds = () => readSource('scripts/ops/digest-css-builds')
  const objectInspectUtilShim = () =>
    readSource('app/javascript/shims/objectInspectUtil.js')
  const viteConfig = () => readSource('vite.config.mjs')

  it('loads Blueprint package CSS through the JavaScript-owned application entry', () => {
    expect(applicationCss()).not.toContain('blueprint')
  })

  it('keeps Blueprint package CSS in the Vite application entry', () => {
    const source = applicationJs()

    expect(source).toEqual(expect.stringContaining("import 'shared/blueprint'"))
    expect(source).toEqual(
      expect.stringContaining("import 'shared/blueprintLegacyNamespace'")
    )
    expect(source).toEqual(
      expect.stringContaining("import 'shared/galaTypography'")
    )
    expect(source).toEqual(
      expect.stringContaining(
        "import { FocusStyleManager } from '@blueprintjs/core'"
      )
    )
    expect(source).toEqual(
      expect.stringContaining("import '@blueprintjs/icons/lib/css/blueprint-icons.css'")
    )
    expect(source).toEqual(
      expect.stringContaining("import '@blueprintjs/core/lib/css/blueprint.css'")
    )
    expect(source).toEqual(
      expect.stringContaining(
        "import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'"
      )
    )
    expect(source).toEqual(
      expect.stringContaining(
        "import '@blueprintjs/select/lib/css/blueprint-select.css'"
      )
    )
  })

  it('emits the Vite application entry with a stable digested filename for Propshaft', () => {
    const source = viteConfig()

    expect(source).toEqual(
      expect.stringContaining("entryFileNames: '[name]-[hash].digested.js'")
    )
    expect(source).toEqual(
      expect.stringContaining("chunkFileNames: '[name]-[hash].digested.js'")
    )
    expect(source).toEqual(
      expect.stringContaining("return 'javascript-[name]-[hash].digested[extname]'")
    )
  })

  it('emits the exact Vite application entry filename from Rails', () => {
    const source = applicationHelper()

    expect(source).toEqual(
      expect.stringContaining("Dir.glob(Rails.root.join('app/assets/builds', \"#{name}-*.digested.js\").to_s)")
    )
    expect(source).toEqual(expect.stringContaining('skip_pipeline: true'))
    expect(source).toEqual(expect.stringContaining('File.basename(path)'))
    expect(source).toEqual(expect.stringContaining("|| name"))
  })

  it('emits content-digested CSS bundles from the build output', () => {
    expect(packageJson()).toEqual(
      expect.stringContaining('node scripts/ops/digest-css-builds')
    )

    const digestScript = digestCssBuilds()
    expect(digestScript).toEqual(expect.stringContaining('.digested.css'))
    expect(digestScript).toEqual(expect.stringContaining("crypto.createHash('sha256')"))

    const helperSource = applicationHelper()
    expect(helperSource).toEqual(
      expect.stringContaining('vite_stylesheet_entry_name(name)')
    )
    expect(helperSource).toEqual(
      expect.stringContaining('stylesheet_link_tag("/assets/#{entry_name}"')
    )
    expect(applicationLayout()).toEqual(
      expect.stringContaining("safe_stylesheet_bundle_tag 'application'")
    )
  })

  it('keeps object-inspect browser-compatible without a Node util polyfill', () => {
    const source = viteConfig()

    expect(source).toEqual(expect.stringContaining('objectInspectBrowserShim'))
    expect(source).toEqual(expect.stringContaining("source === 'object-inspect'"))
    expect(source).toEqual(expect.stringContaining('shims/objectInspect.js'))
    expect(source).toEqual(expect.stringContaining("source === './util.inspect'"))
    expect(source).toEqual(expect.stringContaining("source === 'object-inspect/util.inspect'"))
    expect(source).toEqual(expect.stringContaining("source === 'object-inspect/util.inspect.js'"))
    expect(source).toEqual(expect.stringContaining('source === objectInspectUtilPath'))
    expect(source).toEqual(expect.stringContaining("importer?.includes('/object-inspect/')"))
    expect(objectInspectUtilShim()).toEqual(
      expect.stringContaining("Symbol.for('nodejs.util.inspect.custom')")
    )
  })

  it('maps legacy Node globals for browser-only lazy chunks', () => {
    const source = viteConfig()

    expect(source).toEqual(expect.stringContaining("global: 'globalThis'"))
    expect(applicationJs()).toEqual(
      expect.stringContaining("import 'shims/installProcess'")
    )
  })

  it('preserves the global layout asset order', () => {
    const source = applicationLayout()
    const javascriptBundleIndex = source.indexOf(
      "collected_javascript_bundle_tags 'application'"
    )
    const stylesheetBundleIndex = source.indexOf(
      "collected_stylesheet_bundle_tags 'application'"
    )
    const applicationCssIndex = source.indexOf("safe_stylesheet_bundle_tag 'application'")

    expect(javascriptBundleIndex).toBeGreaterThan(-1)
    expect(stylesheetBundleIndex).toBeGreaterThan(javascriptBundleIndex)
    expect(applicationCssIndex).toBeGreaterThan(stylesheetBundleIndex)
  })

  it('preserves the production Mapbox style fallback for global Mapbox views', () => {
    const source = applicationLayout()
    const mapView = readSource('app/javascript/map_view/index.jsx')

    expect(source).toEqual(
      expect.stringContaining(
        'ENV.fetch("MAPBOX_STYLE", "mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14")'
      )
    )
    expect(source).not.toEqual(
      expect.stringContaining('ENV.fetch("MAPBOX_STYLE", "mapbox://styles/mapbox/dark-v11")')
    )
    expect(mapView).toEqual(expect.stringContaining("token === 'CHANGEME'"))
    expect(mapView).toEqual(expect.stringContaining('if (!MAPBOX_TOKEN || !MAPBOX_STYLE) return null'))
  })

  it('keeps server-rendered Blueprint helper classes mirrored to Blueprint 6', () => {
    const source = blueprintFormBuilder()

    expect(source).toEqual(expect.stringContaining('bp6-button'))
    expect(source).toEqual(expect.stringContaining('bp6-form-group'))
    expect(source).toEqual(expect.stringContaining('bp6-file-input'))
    expect(source).toEqual(expect.stringContaining('bp6-icon-'))
  })

  it('keeps upload wiring compatible with Blueprint 6 file inputs and progress bars', () => {
    const source = applicationJs()

    expect(source).toEqual(expect.stringContaining('.bp6-file-input'))
    expect(source).toEqual(expect.stringContaining('.bp6-file-upload-input'))
    expect(source).toEqual(expect.stringContaining('bp6-progress-bar'))
    expect(source).toEqual(expect.stringContaining('bp6-no-animation'))
  })

  it('keeps global spacing resets compatible with Blueprint 6 classes', () => {
    const source = axiomsScss()

    expect(source).toEqual(expect.stringContaining('.bp6-form-group'))
    expect(source).toEqual(expect.stringContaining('.bp6-callout'))
    expect(source).toEqual(expect.stringContaining('.bp6-button-group'))
    expect(source).toEqual(expect.stringContaining('.bp6-file-input'))
  })
})
