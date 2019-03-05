/**
 * @providesModule MaybeSpotlight
 * @flow
 */

import * as React from 'react'
import TranslatedSpotlight from './TranslatedSpotlight'

import type { Placement } from 'react-popper'

type Props = {
  children: ({ ref: any }) => React.Node,
  placement?: Placement,
  spotlightKey: ?string,
}

export default function MaybeSpotlight ({
  children,
  placement,
  spotlightKey,
}: Props) {
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
