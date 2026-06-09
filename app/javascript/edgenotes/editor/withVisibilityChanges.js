/**
 * Keep track of changes to link expansion visibility
 * @providesModule withVisibilityChanges
 *
 */

import * as React from 'react'

/**
 * Provides `visibility` (an object) and `setVisibility(key, value)` props to the
 * wrapped component. Replaces recompose's withStateHandlers, which relied on
 * React.createFactory (removed in React 19).
 */
export default function withVisibilityChanges (WrappedComponent) {
  return function WithVisibilityChanges (props) {
    const [visibility, setVisibilityState] = React.useState({})
    const setVisibility = React.useCallback(
      (key, value) =>
        setVisibilityState(current => ({ ...current, [key]: value })),
      []
    )

    return React.createElement(WrappedComponent, {
      ...props,
      visibility,
      setVisibility,
    })
  }
}
