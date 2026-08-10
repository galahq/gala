/**
 * @providesModule MaybeSpotlight
 * 
 */

import * as React from 'react'
import TranslatedSpotlight from './TranslatedSpotlight'



// Always renders the Spotlight component tree, even without a spotlightKey —
// switching element types on key presence would remount children (and
// re-subscribe the spotlight) every time a caller toggles the key, as
// StatusBar does with `editing ? 'publish' : undefined`.
export default function MaybeSpotlight ({
  children,
  placement,
  spotlightKey,
}) {
  return (
    <TranslatedSpotlight placement={placement} spotlightKey={spotlightKey}>
      {children}
    </TranslatedSpotlight>
  )
}
