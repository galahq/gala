/* @flow */
import * as React from 'react'

type Props = {
  children: React.Node,
}

type State = {
  hasError: boolean,
  error: ?Error,
  errorInfo: ?{ componentStack: string },
}

/**
 * Error boundary specifically for the map component.
 * Catches React errors and displays a friendly error message with refresh option.
 */
class MapErrorBoundary extends React.Component<Props, State> {
  constructor (props: Props) {
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
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#394B59',
            flexDirection: 'column',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#DB3737',
              marginBottom: '10px',
              fontWeight: 'bold',
            }}
          >
            Map Component Error
          </p>
          <p
            style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}
          >
            Something went wrong with the map component. Please try refreshing
            the page.
          </p>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
            }}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'left' }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
                Error Details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
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
