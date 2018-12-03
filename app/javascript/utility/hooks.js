/**
 * @flow
 */

import * as React from 'react'

import { __RouterContext as RouterContext } from 'react-router'
import type { ContextRouter } from 'react-router-dom'

export function useToggle (initial: boolean = false): [boolean, () => void] {
  // $FlowFixMe
  const [state, set] = React.useState(initial)

  function toggle () {
    set(state => !state)
  }

  return [state, toggle]
}

export function useDocumentTitle (title: string) {
  // $FlowFixMe
  React.useEffect(
    () => {
      document.title = title
    },
    [title]
  )
}

export function useRouter (): ContextRouter {
  // $FlowFixMe
  return React.useContext(RouterContext)
}
