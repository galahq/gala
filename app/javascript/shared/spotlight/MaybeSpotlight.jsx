/**
 * @providesModule MaybeSpotlight
 * 
 */

import * as React from 'react'
import TranslatedSpotlight from './TranslatedSpotlight'



export default function MaybeSpotlight ({
  children,
  placement,
  spotlightKey,
}) {
  if (spotlightKey != null) {
    return (
      <TranslatedSpotlight placement={placement} spotlightKey={spotlightKey}>
        {children}
      </TranslatedSpotlight>
    )
  } else {
    return children({ ref: () => {} })
  }
}
