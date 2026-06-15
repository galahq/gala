/**
 *
 */

import { useRef } from 'react'

export default function useRefStack (setRef) {
  const stack = useRef([])

  return (newValue) => {
    if (stack.current == null) throw new Error('Invariant violation')

    if (newValue) stack.current.push(newValue)
    else stack.current.pop()

    const [last] = stack.current.slice(-1)
    setRef(last || null)
  }
}
