/**
 * Welcome message that changes depending on if the reader is signed in
 *
 * @providesModule WelcomeMessage
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

function WelcomeMessage(props) {
  const getStartedMsg = (
    <>
      <h1>
        <FormattedMessage id="catalog.welcomeMessage.welcomeTitle" />
      </h1>
      <FormattedMessage
        id="catalog.welcomeMessage.toGetStarted"
        values={{
          guideLink: (
            <a href="https://docs.learngala.com/docs">
              <FormattedMessage
                id="catalog.welcomeMessage.guideLinkText"
                defaultMessage="quick start guide"
              />
            </a>
          ),
          aboutLink: (
            <a href="https://about.learngala.com">
              <FormattedMessage
                id="catalog.welcomeBackMessage.aboutLinkText"
                defaultMessage="learn more about us"
              />
            </a>
          ),
        }}
      />
    </>
  )

  const welcomeBackMsg = (
    <>
      <h1>
        <FormattedMessage id="catalog.welcomeMessage.welcomeBackTitle" />
      </h1>
      <FormattedMessage
        id="catalog.welcomeMessage.welcomeBackMessage"
        values={{
          guideLink: (
            <a href="https://docs.learngala.com/">
              <FormattedMessage
                id="catalog.welcomeMessage.guideLinkText"
                defaultMessage="quick start guide"
              />
            </a>
          ),
          newsLink: (
            <a href="https://about.learngala.com">
              <FormattedMessage
                id="catalog.welcomeMessage.newsLinkText"
                defaultMessage="see what we're up to"
              />
            </a>
          ),
        }}
      />
    </>
  )

  return <Container>{reader ? welcomeBackMsg : getStartedMsg}</Container>
}

export default WelcomeMessage

// $FlowFixMe
const Container = styled.aside.attrs({ className: 'pt-dark' })`
  color: white;
  font-family: tenso;
  grid-area: welcome-message;
  hyphens: auto;
  margin-bottom: 1.5em;
  max-width: 700px;

  h1 {
    color: inherit;
    font-family: inherit;
    line-height: 1.2;
    font-size: 170%;
    grid-column: 1 / -1;
    margin-bottom: 0.5rem;
    hyphens: none;
  }

  a {
    color: white;
    font-weight: bold;
  }

  a:hover {
    color: white;
    text-decoration: underline;
  }
`
