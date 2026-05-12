/*  */

const fs = require('fs')
const path = require('path')

const readSource = relativePath =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('Blueprint asset ownership contract', () => {
  const applicationCss = () =>
    readSource('app/assets/stylesheets/application.css')
  const stylesPack = () => readSource('app/javascript/packs/styles.js')
  const applicationLayout = () =>
    readSource('app/views/layouts/application.html.erb')

  it('loads Blueprint package CSS through the Sprockets application manifest', () => {
    expect(applicationCss()).toEqual(
      expect.stringContaining(
        'require @blueprintjs/icons/lib/css/blueprint-icons'
      )
    )
    expect(applicationCss()).toEqual(
      expect.stringContaining('require @blueprintjs/core/lib/css/blueprint')
    )
    expect(applicationCss()).toEqual(
      expect.stringContaining(
        'require @blueprintjs/datetime/lib/css/blueprint-datetime'
      )
    )
    expect(applicationCss()).toEqual(
      expect.stringContaining(
        'require @blueprintjs/popover2/lib/css/blueprint-popover2'
      )
    )
    expect(applicationCss()).toEqual(
      expect.stringContaining(
        'require @blueprintjs/select/lib/css/blueprint-select'
      )
    )
  })

  it('keeps Blueprint package CSS out of the Shakapacker styles pack', () => {
    const source = stylesPack()

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
    expect(source).not.toMatch(/@blueprintjs\/[^'"]+\/lib\/css/)
  })

  it('preserves the global layout asset order', () => {
    const source = applicationLayout()
    const javascriptPackIndex = source.indexOf(
      "collected_javascript_pack_tag 'styles', 'controllers', 'onboarding'"
    )
    const stylesheetPackIndex = source.indexOf(
      "collected_stylesheet_pack_tag 'styles'"
    )
    const sprocketsStylesheetIndex = source.indexOf(
      "stylesheet_link_tag 'application'"
    )

    expect(javascriptPackIndex).toBeGreaterThan(-1)
    expect(stylesheetPackIndex).toBeGreaterThan(javascriptPackIndex)
    expect(sprocketsStylesheetIndex).toBeGreaterThan(stylesheetPackIndex)
  })

  it('preserves the production Mapbox style fallback for global Mapbox views', () => {
    const source = applicationLayout()

    expect(source).toEqual(
      expect.stringContaining(
        'ENV.fetch("MAPBOX_STYLE", "mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14")'
      )
    )
    expect(source).not.toEqual(
      expect.stringContaining('ENV.fetch("MAPBOX_STYLE", "mapbox://styles/mapbox/dark-v11")')
    )
  })
})
