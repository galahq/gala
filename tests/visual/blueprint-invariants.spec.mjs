/**
 * Blueprint theme invariants — content-independent guardrails that encode the
 * findings from the Blueprint-migration styling audit
 * (docs/blueprint-migration-styling-audit.md).
 *
 * Unlike the screenshot-diff suite (visual-routes.spec.mjs), these assert
 * specific computed-style facts, so they:
 *   - need no baseline image (work before the fix exists),
 *   - are immune to seed-content/layout changes,
 *   - give actionable failures ("link is blue, not Gala purple") instead of a
 *     pixel count.
 *
 * They run on the PUBLIC signed-out home, so no auth is required — safe to run
 * against a deployed preview URL (set GALA_BASE_URL).
 *
 * Expected to FAIL on the current Blueprint-6 build (proving they catch the
 * real breakage) and PASS once the palette is re-themed (Fix A+B) and icons are
 * migrated to <Icon> (Fix F).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { test, expect } from '@playwright/test'

// Brand reference. Default = Gala's committed brand definition
// (app/javascript/shared/blueprint.scss), verified against live Blueprint-2 prod.
// If tests/visual/brand-baseline.json exists (written by `pnpm baseline:from-prod`),
// its measured values override these — so the baseline IS "what's live at prod".
const FALLBACK_BRAND = {
  link: [100, 68, 187], // $blue2  -> $pt-link-color
  primary: [115, 80, 211], // $blue3  -> $pt-intent-primary
  success: [66, 158, 74], // $green3 -> $pt-intent-success
}

function loadBrand () {
  try {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'brand-baseline.json')
    const json = JSON.parse(readFileSync(file, 'utf8'))
    if (json.brand?.link && json.brand?.primary && json.brand?.success) {
      console.log(`[invariants] brand baseline from ${json.source} (${json.capturedAt})`)
      return json.brand
    }
  } catch {
    // no baseline file — use the committed brand definition
  }
  return FALLBACK_BRAND
}

const BRAND = loadBrand()
const TOLERANCE = 24 // Euclidean rgb distance; brand vs stock are ~80+ apart

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const rgb = (a) => `rgb(${a.join(', ')})`

/**
 * In-page helpers: normalize any computed color (incl. modern `color(srgb …)`)
 * to [r,g,b] via a canvas, inject canonical Blueprint probe elements, and scan
 * the live DOM. Returned to Node for assertion so failure messages are clear.
 */
const PROBE = () => {
  const toRgb = (colorStr) => {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillStyle = colorStr // invalid value leaves it #000
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }
  const measure = (el, prop) => {
    document.body.appendChild(el)
    const v = getComputedStyle(el)[prop]
    el.remove()
    return toRgb(v)
  }

  // --- theme probes (content-independent) ---
  const a = document.createElement('a')
  a.href = '#'
  a.textContent = 'probe'
  const link = measure(a, 'color')

  const mkBtn = (intent) => {
    const b = document.createElement('button')
    b.className = 'bp6-button bp6-intent-' + intent
    b.textContent = 'probe'
    return b
  }
  const primary = measure(mkBtn('primary'), 'backgroundColor')
  const success = measure(mkBtn('success'), 'backgroundColor')

  // --- DOM scans (real usage on this page) ---
  // class-based icon-font glyphs (pt-icon-<name>/bp4-icon-<name>); Blueprint 6
  // ships no icon classes, so any of these render blank -> must be <Icon>.
  const GLYPH = /\b(pt|bp4)-icon-(?!standard\b|large\b)[a-z]/
  const iconGlyphs = [...document.querySelectorAll('[class*="pt-icon-"],[class*="bp4-icon-"]')]
    .filter((el) => GLYPH.test(el.className.toString()))
    .map((el) => el.className.toString().slice(0, 70))

  // legacy Blueprint elements rendering with no structural styling
  const unstyledLegacy = [...document.querySelectorAll('[class*="pt-button"],[class*="bp4-button"]')]
    .filter((el) => !/\bbp6-button\b/.test(el.className.toString()))
    .filter((el) => {
      const cs = getComputedStyle(el)
      return cs.paddingLeft === '0px' && cs.backgroundColor === 'rgba(0, 0, 0, 0)'
    })
    .map((el) => el.className.toString().slice(0, 70))

  return { link, primary, success, iconGlyphs, unstyledLegacy }
}

async function probe (page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  return page.evaluate(PROBE)
}

test.describe('Blueprint theme invariants (signed-out home)', () => {
  test('links use Gala brand purple, not stock Blueprint blue', async ({ page }) => {
    const { link } = await probe(page)
    expect(
      dist(link, BRAND.link) <= TOLERANCE,
      `link color ${rgb(link)} should be Gala purple ${rgb(BRAND.link)} (got stock blue?)`
    ).toBe(true)
  })

  test('primary-intent buttons use Gala brand purple', async ({ page }) => {
    const { primary } = await probe(page)
    expect(
      dist(primary, BRAND.primary) <= TOLERANCE,
      `primary button bg ${rgb(primary)} should be Gala purple ${rgb(BRAND.primary)}`
    ).toBe(true)
  })

  test('success-intent buttons use Gala brand green', async ({ page }) => {
    const { success } = await probe(page)
    expect(
      dist(success, BRAND.success) <= TOLERANCE,
      `success button bg ${rgb(success)} should be Gala green ${rgb(BRAND.success)}`
    ).toBe(true)
  })

  test('no class-based icon-font glyphs (use the <Icon> component)', async ({ page }) => {
    const { iconGlyphs } = await probe(page)
    expect(
      iconGlyphs,
      `Blueprint 6 has no icon-font classes; these render blank — migrate to <Icon>:\n${iconGlyphs.join('\n')}`
    ).toEqual([])
  })

  test('no legacy Blueprint elements render unstyled', async ({ page }) => {
    const { unstyledLegacy } = await probe(page)
    expect(
      unstyledLegacy,
      `pt-/bp4- elements with no bp6- structural styling:\n${unstyledLegacy.join('\n')}`
    ).toEqual([])
  })
})
