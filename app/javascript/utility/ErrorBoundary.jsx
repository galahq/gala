/**
 * @providesModule ErrorBoundary
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { NonIdealState } from '@blueprintjs/core'

class ErrorBoundary extends React.Component<
  { children: React.Node },
  { hasError: boolean, error: ?Error, info: ?{ componentStack: string } }
> {
  state = { hasError: false, error: null, info: null }

  componentDidCatch (error: Error, info: ?{ componentStack: string }) {
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
              <InfoBox>
                <code>
                  Uncaught {error?.name}: {error?.message}
                  {'\n'}
                  {info?.componentStack}
                </code>
              </InfoBox>
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

const InfoBox = styled.pre`
  text-align: left;
  margin: 16px;
  overflow-x: scroll;

  & code {
    white-space: pre;
  }
`
