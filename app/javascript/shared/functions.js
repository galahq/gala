/**
 * @flow
 */

import {
  compose,
  either,
  flatten,
  isEmpty,
  isNil,
  map,
  none,
  values,
} from 'ramda'

const listValues = map(values)

// Returns true if input array has no blank elements
// isCompact(["a", "", "c"]) => false
export const isCompact: (string[]) => boolean = none(isEmpty)

// Returns true if input array has no elements with any blank values
// isCompact([{a: "1", b: "2"}, {a: "", b: "2"}]) => false
export const areObjectsCompact: (Object[]) => boolean = compose(
  isCompact,
  flatten,
  listValues
)

export const isBlank: any => boolean = either(isEmpty, isNil)

export function ensureHttp (url: string) {
  if (url.match(/^https?:\/\//)) return url
  return `http://${url}`
}

export function reorder<T> (
  sourceIndex: number,
  destinationIndex: number,
  array: T[]
): T[] {
  const newArray = [...array]
  const [element] = newArray.splice(sourceIndex, 1)
  newArray.splice(destinationIndex, 0, element)
  return newArray
}

export function normalize<T: {}> (array: T[], key: $Keys<T>): { [string]: T } {
  return array.reduce((table, element) => {
    table[element[key]] = element
    return table
  }, ({}: { [string]: T }))
}
