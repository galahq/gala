/**
 * @flow
 */

import { useState } from 'react'

export default function useToggle (initial: boolean = false) {
  const [state, set] = useState(initial)

  function toggle () {
    set(state => !state)
  }

  return [state, toggle]
}
