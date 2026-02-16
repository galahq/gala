/* @flow */
import * as React from 'react'
import { Button, Intent, NonIdealState } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

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
    <div className="c-stats-map-error" role="alert" aria-live="assertive">
      <p className="c-stats-map-error__title">
        <FormattedMessage id="cases.stats.show.errorMapTitle" />
      </p>
      <p className="c-stats-map-error__message">
        {errorMessage || (
          <FormattedMessage id="cases.stats.show.errorMapDescription" />
        )}
      </p>
      <Button
        className="c-stats-map-error__retry"
        intent={Intent.PRIMARY}
        onClick={onRetry}
      >
        <FormattedMessage id="cases.stats.show.errorMapRetry" />
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
