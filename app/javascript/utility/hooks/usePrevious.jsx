/**
 * @providesModule usePrevious
 * @flow
 */

import { useEffect, useRef } from 'react'

export default function usePrevious<T> (value: $ReadOnly<T>) {
  const ref = useRef()

  useEffect(
    () => {
      ref.current = value
    },
    [value]
  )

  return ref.current
}
