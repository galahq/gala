/**
 * @flow
 */

import { useRef } from 'react'

export default function useRefStack (setRef: any => void) {
  const stack = useRef([])

  return (newValue: any) => {
    if (stack.current == null) throw new Error('Invariant violation')

    if (newValue) stack.current.push(newValue)
    else stack.current.pop()

    const [last] = stack.current.slice(-1)
    setRef(last || null)
  }
}
