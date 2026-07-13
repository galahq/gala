/**
 * Fix A — Blueprint namespace codemod: pt-* / bp4-* → bp6-* in class strings.
 *
 *   node scripts/fixA-namespace-codemod.mjs          # dry run (reports only)
 *   node scripts/fixA-namespace-codemod.mjs --write  # apply
 *
 * SAFE-BY-DESIGN exclusions (left untouched, handled separately):
 *   - icon glyphs (pt-icon* / bp4-icon*)         → Fix F (migrate to <Icon>)
 *   - structural renames where BP6 has no 1:1 class (callout-title, non-ideal-state-*,
 *     spinner-svg-container, typography, text-link, intent-none) → manual follow-up
 *   - Gala-custom class `pt-unsaturated` (not a Blueprint class)
 *   - `.scss` files and the legacy shim (handled separately)
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const WRITE = process.argv.includes('--write')
const ROOTS = ['app/javascript', 'app/views']
const EXTS = new Set(['.jsx', '.tsx', '.js', '.haml', '.erb'])
const SKIP_FILES = new Set(['blueprintLegacyNamespace.js'])

// token suffixes (after the pt-/bp4- prefix) to LEAVE ALONE
const EXCEPT = new Set([
  'callout-title', 'callout-content',
  'non-ideal-state-action', 'non-ideal-state-description',
  'non-ideal-state-icon', 'non-ideal-state-title',
  'intent-none', 'line-height', 'spinner-svg-container',
  'text-link', 'typography', 'unsaturated',
])

const TOKEN = /\b(pt|bp4)-[a-z0-9]+(?:-[a-z0-9]+)*\b/g

function shouldReplace(tok) {
  const suffix = tok.replace(/^(pt|bp4)-/, '')
  if (/^icon(-|$)/.test(suffix)) return false // icons → Fix F
  if (EXCEPT.has(suffix)) return false
  return true
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (EXTS.has(path.extname(p)) && !SKIP_FILES.has(name)) out.push(p)
  }
  return out
}

let filesChanged = 0
let totalRepl = 0
const skipped = {}
const perFile = []

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8')
    let count = 0
    const out = src.replace(TOKEN, (tok) => {
      if (shouldReplace(tok)) {
        count++
        return tok.replace(/^(pt|bp4)-/, 'bp6-')
      }
      const suffix = tok.replace(/^(pt|bp4)-/, '')
      const key = /^icon(-|$)/.test(suffix) ? '(icons)' : suffix
      skipped[key] = (skipped[key] || 0) + 1
      return tok
    })
    if (count > 0) {
      filesChanged++
      totalRepl += count
      perFile.push([file, count])
      if (WRITE) writeFileSync(file, out)
    }
  }
}

perFile.sort((a, b) => b[1] - a[1])
console.log(`${WRITE ? 'APPLIED' : 'DRY RUN'} — ${totalRepl} replacements across ${filesChanged} files\n`)
console.log('Top files:')
for (const [f, c] of perFile.slice(0, 15)) console.log(`  ${c.toString().padStart(4)}  ${f}`)
console.log('\nLeft untouched (need separate handling), by token:')
for (const [k, c] of Object.entries(skipped).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.toString().padStart(4)}  ${k}`)
}
if (!WRITE) console.log('\n(dry run — no files written; re-run with --write to apply)')
