/**
 *
 */

import { useState, useCallback } from 'react'
import { append, update, remove } from 'ramda'




export default function useArray ({
  defaultArray = [],
  arrayUseState = useState(defaultArray),
  array = arrayUseState[0],
  setArray = arrayUseState[1],
  defaultElement,
} = {}) {
  const onAppend = useCallback(
    () => {
      setArray(append(defaultElement, array))
    },
    [array, setArray, defaultElement]
  )

  const onUpdate = useCallback(
    (i, value) => {
      setArray(update(i, value, array))
    },
    [array, setArray]
  )

  const onRemove = useCallback(
    (i) => {
      setArray(remove(i, 1, array))
    },
    [array, setArray]
  )

  return [array, onAppend, onUpdate, onRemove]
}
