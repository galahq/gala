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

type MapErrorBoundaryProps = {
  children: React.Node,
}

type MapErrorBoundaryState = {
  hasError: boolean,
  error: ?Error,
  errorInfo: ?{ componentStack: string },
}

class MapErrorBoundary extends React.Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor (props: MapErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError (_error: Error): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch (error: Error, errorInfo: { componentStack: string }) {
    console.error('Map component error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render (): React.Node {
    if (this.state.hasError) {
      return (
        <div className="c-stats-map-error">
          <p className="c-stats-map-error__title">
            Map Component Error
          </p>
          <p className="c-stats-map-error__message">
            Something went wrong with the map component. Please try refreshing
            the page.
          </p>
          <Button
            intent={Intent.PRIMARY}
            style={{ marginBottom: '15px' }}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          {this.state.error && (
            <details className="c-stats-map-error__details">
              <summary className="c-stats-map-error__details-summary">
                Error Details
              </summary>
              <pre className="c-stats-map-error__details-pre">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default MapErrorBoundary
