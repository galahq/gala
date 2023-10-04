/**
 * @providesModule locales
 * @noflow
 */

import { chain, map, toPairs, fromPairs, mergeAll } from 'ramda'
import camelize from 'camelize'

// Convert from deeply nested locale object to a flat object with dot
// separators to index into the path.
const flattenObj = obj => {
  const go = obj_ =>
    chain(([k, v]) => {
      if (Object.prototype.toString.call(v) === '[object Object]') {
        return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
      } else {
        return [[k, v]]
      }
    }, toPairs(obj_))

  return fromPairs(go(camelize(obj)))
}

export default (async function (locale) {
  const fallbackMessages = await import(`./en.yml`)
  const messages = await import(`./${locale}.yml`)
  return mergeAll([
    flattenObj(fallbackMessages['en']),
    flattenObj(messages[locale]),
  ])
})
