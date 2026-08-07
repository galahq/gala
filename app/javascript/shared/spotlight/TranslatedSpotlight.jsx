/**
 * @providesModule TranslatedSpotlight
 * 
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { camelCase } from 'change-case'

import Spotlight from './index'



function TranslatedSpotlight ({ children, placement, spotlightKey }) {
  return (
    <Spotlight
      content={
        spotlightKey != null && (
          <FormattedMessage id={`spotlights.${camelCase(spotlightKey)}`} />
        )
      }
      placement={placement}
      spotlightKey={spotlightKey}
    >
      {children}
    </Spotlight>
  )
}

export default TranslatedSpotlight
