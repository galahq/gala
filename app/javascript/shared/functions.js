/**
 * @flow
 */

import { compose, isEmpty, map, none, values, flatten } from 'ramda'

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
