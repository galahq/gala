/**
 * Marketing language visible when the user is not signed in.
 *
 * @providesModule ValueProposition
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

const ValueProposition = () => (
  <Container>
    <Block icon="add-row-bottom" theme="red">
      <h2 className="bp4-callout-title">
        <FormattedMessage id="catalog.impactfulCases" />
      </h2>
      <p>
        <FormattedMessage id="catalog.findACase" />
      </p>
    </Block>

    <Block icon="social-media" theme="green">
      <h2 className="bp4-callout-title">
        <FormattedMessage id="catalog.innovativeTeaching" />
      </h2>
      <p>
        <FormattedMessage id="catalog.improveYourCommunication" />
      </p>
    </Block>

    <Block icon="git-new-branch" theme="blue">
      <h2 className="bp4-callout-title">
        <FormattedMessage id="catalog.inclusiveCommunity" />
      </h2>
      <p>
        <FormattedMessage id="catalog.joinTheCommunity" />
      </p>
    </Block>
  </Container>
)
export default ValueProposition

// $FlowFixMe
const Container = styled.aside.attrs({ className: 'bp4-dark' })`
  color: white;
  display: grid;
  font-family: tenso;
  grid-area: value-proposition;
  grid-gap: 1em 1.5em;
  grid-template-columns: repeat(3, 1fr);
  hyphens: auto;
  margin-bottom: 1.5em;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }

  h1,
  h2 {
    color: inherit;
    font-family: inherit;
    line-height: 1.2;
  }
  h1 {
    font-size: 170%;
    grid-column: 1 / -1;
  }
  h2 {
    font-size: 130%;
  }

  h1,
  p {
    margin-bottom: 0;
  }
`

const intents = {
  red: 'bp4-intent-danger',
  green: 'bp4-intent-success',
  blue: 'bp4-intent-primary',
}

const contrastColors = {
  red: 'hsl(20, 93%, 78%)',
  green: 'hsl(145, 76%, 73%)',
  blue: 'hsl(275, 100%, 87%)',
}

const Block = styled.div.attrs(({ theme, icon }) => ({
  className: `bp4-callout ${intents[theme]} bp4-icon-${icon}`,
}))`
  padding: 1.25em;

  &::before {
    top: 17px !important;
  }

  &::before,
  .bp4-callout-title {
    color: ${p => contrastColors[p.theme]} !important;
  }
`
