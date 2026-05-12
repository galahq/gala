/**
 * 
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
export const isCompact = none(isEmpty)

// Returns true if input array has no elements with any blank values
// isCompact([{a: "1", b: "2"}, {a: "", b: "2"}]) => false
export const areObjectsCompact = compose(
  isCompact,
  flatten,
  listValues
)

export const isBlank = either(isEmpty, isNil)

export function ensureHttp (url) {
  if (url.match(/^https?:\/\//)) return url
  return `http://${url}`
}

export function reorder (
  sourceIndex,
  destinationIndex,
  array
) {
  const newArray = [...array]
  const [element] = newArray.splice(sourceIndex, 1)
  newArray.splice(destinationIndex, 0, element)
  return newArray
}

export function normalize (array, key) {
  return array.reduce((table, element) => {
    table[element[key]] = element
    return table
  }, ({}))
}
