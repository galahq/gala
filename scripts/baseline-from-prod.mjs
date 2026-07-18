/**
 * Capture Gala's brand colors from the live reference site and write them as the
 * baseline the Blueprint theme-invariant tests compare against
 * (tests/visual/blueprint-invariants.spec.mjs).
 *
 *   pnpm baseline:from-prod                 # uses https://www.learngala.com
 *   GALA_REFERENCE_URL=https://… pnpm baseline:from-prod
 *
 * Why measure live instead of hardcoding: it pins the baseline to "what the
 * known-good production site actually renders." It is version-agnostic — the
 * probe carries pt-/bp4-/bp6- classes so it reads whatever namespace the target
 * uses — and content-independent (it injects throwaway elements, so seed data /
 * which cases exist don't matter).
 *
 * IMPORTANT: this is only a valid "correct" reference while production is still
 * the old Blueprint 2 app. After the DNS cutover to the new Blueprint 6 app,
 * stop trusting live prod and pin to the committed brand definition in
 * app/javascript/shared/blueprint.scss instead.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright'

const REFERENCE_URL = process.env.GALA_REFERENCE_URL || 'https://www.learngala.com'
const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'tests',
  'visual',
  'brand-baseline.json'
)

// Runs in the page: normalize any computed color (incl. color(srgb …)) to
// [r,g,b] via canvas, and measure brand colors from injected probe elements.
const probe = () => {
  const toRgb = (colorStr) => {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillStyle = colorStr
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

  const a = document.createElement('a')
  a.href = '#'
  a.textContent = 'probe'
  const link = measure(a, 'color')

  // carry every namespace so the right one is styled whatever version is live
  const mkBtn = (intent) => {
    const b = document.createElement('button')
    b.className = [
      'pt-button bp4-button bp6-button',
      `pt-intent-${intent} bp4-intent-${intent} bp6-intent-${intent}`,
    ].join(' ')
    b.textContent = 'probe'
    return b
  }
  return {
    link,
    primary: measure(mkBtn('primary'), 'backgroundColor'),
    success: measure(mkBtn('success'), 'backgroundColor'),
  }
}

async function main () {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    console.log(`Measuring brand colors from ${REFERENCE_URL} …`)
    await page.goto(REFERENCE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    const brand = await page.evaluate(probe)

    const payload = {
      source: REFERENCE_URL,
      capturedAt: new Date().toISOString(),
      note:
        'Brand colors measured live from the reference site. Re-run `pnpm baseline:from-prod`. ' +
        'Valid only while prod is the old Blueprint 2 app; after DNS cutover, pin to blueprint.scss vars.',
      brand,
    }
    writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n')

    const rgb = (a) => `rgb(${a.join(', ')})`
    console.log('Wrote', path.relative(process.cwd(), OUT))
    console.log(`  link    = ${rgb(brand.link)}`)
    console.log(`  primary = ${rgb(brand.primary)}`)
    console.log(`  success = ${rgb(brand.success)}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('baseline:from-prod failed:', err.message)
  process.exit(1)
})
