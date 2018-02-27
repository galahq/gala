/**
 * @providesModule locales
 * @flow
 */

// $FlowFixMe
import am from './am.yml' // $FlowFixMe
import en from './en.yml' // $FlowFixMe
import es from './es.yml' // $FlowFixMe
import fr from './fr.yml' // $FlowFixMe
import ja from './ja.yml' // $FlowFixMe
import zhCN from './zh-CN.yml' // $FlowFixMe
import zhTW from './zh-TW.yml' // $FlowFixMe

import { chain, map, merge, toPairs, fromPairs } from 'ramda'
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

const withFallback = merge(flattenObj(en.en))

export default {
  am: withFallback(flattenObj(am.am)),
  en: flattenObj(en.en),
  es: withFallback(flattenObj(es.es)),
  fr: withFallback(flattenObj(fr.fr)),
  ja: withFallback(flattenObj(ja.ja)),
  zhCN: withFallback(flattenObj(zhCN['zh-CN'])),
  zhTW: withFallback(flattenObj(zhTW['zh-TW'])),
}
