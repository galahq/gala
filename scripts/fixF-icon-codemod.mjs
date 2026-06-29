/**
 * Fix F (part 1) — icon namespace: pt-icon* / bp4-icon* → bp6-icon* in class strings.
 * (Fix A's codemod deliberately skipped icons; this finishes them.)
 * Part 2 regenerates the bp6-icon-* font CSS so these classes render.
 *
 *   node scripts/fixF-icon-codemod.mjs          # dry run
 *   node scripts/fixF-icon-codemod.mjs --write  # apply
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const WRITE = process.argv.includes('--write')
const ROOTS = ['app/javascript', 'app/views']
const EXTS = new Set(['.jsx', '.tsx', '.js', '.haml', '.erb'])
const TOKEN = /\b(pt|bp4)-icon(?:-[a-z0-9]+)*\b/g

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    statSync(p).isDirectory() ? walk(p, out) : EXTS.has(path.extname(p)) && out.push(p)
  }
  return out
}

let files = 0
let total = 0
const per = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8')
    let count = 0
    const out = src.replace(TOKEN, (tok) => {
      count++
      return tok.replace(/^(pt|bp4)-/, 'bp6-')
    })
    if (count > 0) {
      files++
      total += count
      per.push([file, count])
      if (WRITE) writeFileSync(file, out)
    }
  }
}
per.sort((a, b) => b[1] - a[1])
console.log(`${WRITE ? 'APPLIED' : 'DRY RUN'} — ${total} icon-class replacements across ${files} files\n`)
for (const [f, c] of per.slice(0, 12)) console.log(`  ${c.toString().padStart(3)}  ${f}`)
if (!WRITE) console.log('\n(dry run — re-run with --write to apply)')
