/**
 * @flow
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRefStack } from 'utility/hooks'

export default function useControllableFocus () {
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
