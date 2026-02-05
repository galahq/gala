/* @flow */
import * as React from 'react'
import { NonIdealState } from '@blueprintjs/core'

type Props = {
  intl: any,
}

/**
 * Empty state displayed when there's no data to show on the map
 */
function MapEmptyState ({ intl }: Props): React.Node {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(249, 250, 251, 0.95)',
        pointerEvents: 'none',
      }}
    >
      <NonIdealState
        title={intl.formatMessage({ id: 'cases.stats.show.errorNoDataTitle' })}
        description={intl.formatMessage({ id: 'cases.stats.show.errorNoDataDescription' })}
        visual="geosearch"
      />
    </div>
  )
}

export default MapEmptyState
