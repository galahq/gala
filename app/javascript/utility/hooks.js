/**
 * @flow
 */

import * as React from 'react'

export function useToggle (initial: boolean = false): [boolean, () => void] {
  // $FlowFixMe
  const [state, set] = React.useState(initial)

  function toggle () {
    set(state => !state)
  }

  return [state, toggle]
}
