/**
 * @providesModule ErrorBoundary
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { Button, Intent, NonIdealState } from '@blueprintjs/core'

class ErrorBoundary extends React.Component<
  { children: React.Node },
  { hasError: boolean, error: ?Error, info: ?{ componentStack: string } }
> {
  state = { hasError: false, error: null, info: null }

  componentDidCatch (error: Error, info: { componentStack: string }) {
    this.setState({ hasError: true, error, info })

    Sentry.withScope(scope => {
      Object.keys(info).forEach(key => {
        scope.setExtra(key, info[key])
      })

      Sentry.captureException(error)
    })
  }

  render () {
    const { hasError, error, info } = this.state
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Container>
          <NonIdealState
            visual="error"
            title="Something went wrong"
            description={
              <>
                <Button
                  icon="comment"
                  intent={Intent.PRIMARY}
                  onClick={() => Sentry.showReportDialog()}
                >
                  Report feedback
                </Button>
                <InfoBox error={error} info={info} />
              </>
            }
          />
        </Container>
      )
    }
    return this.props.children
  }
}
export default ErrorBoundary
// $FlowFixMe
const Container = styled.div.attrs({ className: 'pt-dark' })`
  margin-top: 40px;

  & .pt-non-ideal-state {
    max-width: 800px;

    & .pt-non-ideal-state-description {
      width: 100%;
    }
  }
`
class InfoBox extends React.Component<
  { error: ?Error, info: ?{ componentStack: string } },
  { detailsVisible: boolean }
> {
  state = {
    detailsVisible: false,
  }
  render () {
    const { error, info } = this.props
    const { detailsVisible } = this.state
    return (
      <InfoBoxContainer>
        {detailsVisible ? (
          <InfoBoxDetails>
            <code>
              Uncaught {error?.name}: {error?.message}
              {'\n'}
              {info?.componentStack}
            </code>
          </InfoBoxDetails>
        ) : (
          <Button
            icon="info-sign"
            onClick={() => this.setState({ detailsVisible: true })}
          >
            Show Details
          </Button>
        )}
      </InfoBoxContainer>
    )
  }
}

const InfoBoxContainer = styled.div`
  margin: 16px;
`
const InfoBoxDetails = styled.pre`
  text-align: left;
  overflow-x: scroll;

  & code {
    white-space: pre;
  }
`
