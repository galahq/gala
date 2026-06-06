/**
 * @providesModule ErrorBoundary
 * 
 */

import * as React from 'react'
import styled from 'styled-components'

import { Button, NonIdealState } from '@blueprintjs/core'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, info: null }

  componentDidCatch (error, info) {
    this.setState({ hasError: true, error, info })
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
              <InfoBox error={error} info={info} />
            }
          />
        </Container>
      )
    }
    return this.props.children
  }
}
export default ErrorBoundary
const Container = styled.div.attrs({ className: 'pt-dark' })`
  margin-top: 40px;

  & .pt-non-ideal-state {
    max-width: 800px;

    & .pt-non-ideal-state-description {
      width: 100%;
    }
  }
`
class InfoBox extends React.Component {
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
