/**
 * @providesModule TranslatedSpotlight
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { camelCase } from 'change-case'

import Spotlight from './index'

import type { Placement } from 'react-popper'

type Props = {
  children: ({ ref: any }) => React.Node,
  placement?: Placement,
  spotlightKey: string,
}

function TranslatedSpotlight ({ children, placement, spotlightKey }: Props) {
  return (
    <Spotlight
      content={
        <FormattedMessage id={`spotlights.${camelCase(spotlightKey)}`} />
      }
      placement={placement}
      spotlightKey={spotlightKey}
    >
      {({ ref }) => children({ ref })}
    </Spotlight>
  )
}

export default TranslatedSpotlight
