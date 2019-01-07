/**
 * @flow
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import * as R from 'ramda'

export function useToggle (initial: boolean = false): [boolean, () => void] {
  const [state, set] = useState(initial)

  function toggle () {
    set(state => !state)
  }

  return [state, toggle]
}

export function useDocumentTitle (title: string) {
  useEffect(
    () => {
      document.title = title
    },
    [title]
  )
}

type UseArrayOptions<T> = {
  defaultArray?: T[],
  arrayUseState?: [T[], (T[]) => void],
  array?: T[],
  setArray?: (T[]) => void,
  defaultElement: T,
}

type UseArrayReturn<T> = [
  T[],
  () => void,
  (index: number, value: T) => void,
  (index: number) => void,
]

export function useArray<T> ({
  defaultArray = [],
  // $FlowFixMe
  arrayUseState = useState(defaultArray),
  array = arrayUseState[0],
  setArray = arrayUseState[1],
  defaultElement,
}: UseArrayOptions<T> = {}): UseArrayReturn<T> {
  const onAppend = useCallback(
    () => {
      setArray(R.append(defaultElement, array))
    },
    [array, setArray, defaultElement]
  )

  const onUpdate = useCallback(
    // $FlowFixMe
    (i: number, value: T) => {
      setArray(R.update(i, value, array))
    },
    [array, setArray]
  )

  const onRemove = useCallback(
    // $FlowFixMe
    (i: number) => {
      setArray(R.remove(i, 1, array))
    },
    [array, setArray]
  )

  return [array, onAppend, onUpdate, onRemove]
}

export function useControllableFocus () {
  const ref = useRef<*>(null)

  const setRef = useRefStack(value => {
    ref.current = value
  })

  const [shouldFocus, setShouldFocus] = useState(false)

  useEffect(
    () => {
      if (shouldFocus) ref.current && ref.current.focus()
      setShouldFocus(false)
    },
    [shouldFocus, setShouldFocus, ref.current]
  )

  const focus = useCallback(() => setShouldFocus(true), [
    ref.current,
    setShouldFocus,
  ])

  return [setRef, focus]
}

export function useRefStack (setRef: any => void) {
  const stack = useRef([])

  return (newValue: any) => {
    if (stack.current == null) throw new Error('Invariant violation')

    if (newValue) stack.current.push(newValue)
    else stack.current.pop()

    const [last] = stack.current.slice(-1)
    setRef(last || null)
  }
}
