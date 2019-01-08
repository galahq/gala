/**
 * @flow
 */

import { useState, useCallback } from 'react'
import { append, update, remove } from 'ramda'

type UseArrayOptions<T> = {
  defaultArray?: T[],
  arrayUseState?: [T[], (T[]) => void],
  array?: T[],
  setArray?: (T[]) => void,
  defaultElement: T,
}

type AppendFunction = () => void
type UpdateFunction<T> = (index: number, value: T) => void
type RemoveFunction = (index: number) => void

type UseArrayReturn<T> = [
  T[],
  AppendFunction,
  UpdateFunction<T>,
  RemoveFunction,
]

export default function useArray<T> ({
  defaultArray = [],
  // $FlowFixMe
  arrayUseState = useState(defaultArray),
  array = arrayUseState[0],
  setArray = arrayUseState[1],
  defaultElement,
}: UseArrayOptions<T> = {}): UseArrayReturn<T> {
  const onAppend = useCallback(
    () => {
      setArray(append(defaultElement, array))
    },
    [array, setArray, defaultElement]
  )

  const onUpdate = useCallback(
    // $FlowFixMe
    (i: number, value: T) => {
      setArray(update(i, value, array))
    },
    [array, setArray]
  )

  const onRemove = useCallback(
    // $FlowFixMe
    (i: number) => {
      setArray(remove(i, 1, array))
    },
    [array, setArray]
  )

  return [array, onAppend, onUpdate, onRemove]
}
