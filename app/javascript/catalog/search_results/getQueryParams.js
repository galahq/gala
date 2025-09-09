/**
 * @providesModule getQueryParams
 * @flow
 */

import qs from 'qs'
import { map } from 'ramda'

import type { Location } from 'react-router-dom'

export type Query = { [string]: string[] }

export default function getQueryParams ({ search, pathname }: Location): Query {
  return {
    ...coerceIntoArrayValues(qs.parse(search, { ignoreQueryPrefix: true })),
    ...getQueryFromPathname(pathname),
  }
}

function coerceIntoArrayValues (params: {
  [string]: string | string[],
}): { [string]: string[] } {
  return map(x => (Array.isArray(x) ? x : [x]), params)
}

function getQueryFromPathname (pathname: string): { [string]: string[] } {
  return ['libraries', 'tags', 'languages'].reduce((params, key) => {
    const match = pathname.match(RegExp(`${key}/([0-9a-z%+-]+)`))
    if (!match) return params
    params[key] = [match[1]]
    return params
  }, {})
}
