/* @flow */
import * as React from 'react'

import { Colors } from '../colors'

type Props = {
  countryCount: number,
}

/**
 * Error state displayed when there's too much data to render efficiently
 */
function MapTooMuchDataState ({ countryCount }: Props): React.Node {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: Colors.GRAY1,
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          color: Colors.DANGER,
          marginBottom: '10px',
          fontWeight: 'bold',
        }}
      >
        Too Much Data
      </p>
      <p
        style={{ color: Colors.GRAY5, fontSize: '14px', marginBottom: '15px' }}
      >
        The selected date range contains too much data to display efficiently.
        Please choose a smaller date range.
      </p>
      <p style={{ color: Colors.GRAY5, fontSize: '12px' }}>
        Countries: {countryCount}
      </p>
    </div>
  )
}

export default MapTooMuchDataState
