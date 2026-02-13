/* @flow */
import * as React from 'react'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'

type MapErrorStateProps = {
  errorMessage: string,
  mapboxToken: string,
  mapboxStyle: string,
  mapboxDataUrl: string,
  onRetry: () => void,
}

export function MapErrorState ({
  errorMessage,
  mapboxToken,
  mapboxStyle,
  mapboxDataUrl,
  onRetry,
}: MapErrorStateProps): React.Node {
  return (
    <div className="c-stats-map-error">
      <p className="c-stats-map-error__title">
        Unable to load map
      </p>
      <p className="c-stats-map-error__message">
        {errorMessage ||
          'Please check your internet connection or disable ad blockers'}
      </p>
      <Button
        intent={Intent.PRIMARY}
        style={{ marginBottom: '15px' }}
        onClick={onRetry}
      >
        Retry Loading Map
      </Button>
      <div className="c-stats-map-error__debug">
        <p>Debug info:</p>
        <p>Token: {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none'}</p>
        <p>Style: {mapboxStyle}</p>
        <p>Data: {mapboxDataUrl}</p>
      </div>
    </div>
  )
}

type MapEmptyStateProps = {
  intl: any,
}

export function MapEmptyState ({ intl }: MapEmptyStateProps): React.Node {
  return (
    <NonIdealState
      title={intl.formatMessage({ id: 'cases.stats.show.errorNoDataTitle' })}
      description={intl.formatMessage({ id: 'cases.stats.show.errorNoDataDescription' })}
      visual="geosearch"
    />
  )
}
