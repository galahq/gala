/* @flow */
import * as React from 'react'

import { Colors } from '../colors'

type Props = {
  errorMessage: string,
  mapboxToken: string,
  mapboxStyle: string,
  mapboxDataUrl: string,
  onRetry: () => void,
}

/**
 * Error state displayed when the map fails to load
 */
function MapErrorState ({
  errorMessage,
  mapboxToken,
  mapboxStyle,
  mapboxDataUrl,
  onRetry,
}: Props): React.Node {
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
        Unable to load map
      </p>
      <p
        style={{ color: Colors.GRAY5, fontSize: '14px', marginBottom: '15px' }}
      >
        {errorMessage ||
          'Please check your internet connection or disable ad blockers'}
      </p>
      <button
        style={{
          padding: '8px 16px',
          backgroundColor: Colors.PRIMARY,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '15px',
        }}
        onClick={onRetry}
      >
        Retry Loading Map
      </button>
      <div style={{ fontSize: '12px', color: Colors.GRAY5 }}>
        <p>Debug info:</p>
        <p>Token: {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none'}</p>
        <p>Style: {mapboxStyle}</p>
        <p>Data: {mapboxDataUrl}</p>
      </div>
    </div>
  )
}

export default MapErrorState
