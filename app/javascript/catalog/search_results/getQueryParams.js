/**
 * @providesModule getQueryParams
 *
 */

import qs from 'qs'
import { map } from 'ramda'



export default function getQueryParams ({ search, pathname }) {
  return {
    ...coerceIntoArrayValues(qs.parse(search, { ignoreQueryPrefix: true })),
    ...getQueryFromPathname(pathname),
  }
}

function coerceIntoArrayValues (params) {
  return map(x => (Array.isArray(x) ? x : [x]), params)
}

function getQueryFromPathname (pathname) {
  return ['libraries', 'tags', 'languages'].reduce((params, key) => {
    const match = pathname.match(RegExp(`${key}/([0-9a-z%+-]+)`))
    if (!match) return params
    params[key] = [match[1]]
    return params
  }, {})
}
