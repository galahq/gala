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
    <h1>
      <FormattedMessage id="catalog.openAccessLearningTools" />
    </h1>

    <div className="pt-callout pt-icon-book pt-intent-danger">
      <h5 className="pt-callout-title">
        <FormattedMessage id="catalog.impactfulCases" />
      </h5>
      <p>
        <FormattedMessage id="catalog.findACase" />
      </p>
    </div>
    <div className="pt-callout pt-intent-success pt-icon-thumbs-up">
      <h5 className="pt-callout-title">
        <FormattedMessage id="catalog.innovativeTeaching" />
      </h5>
      <p>
        <FormattedMessage id="catalog.improveYourCommunication" />
      </p>
    </div>
    <div className="pt-callout pt-intent-primary pt-icon-chat">
      <h5 className="pt-callout-title">
        <FormattedMessage id="catalog.inclusiveCommunity" />
      </h5>
      <p>
        <FormattedMessage id="catalog.joinTheCommunity" />
      </p>
    </div>
  </Container>
)
export default ValueProposition

const Container = styled.aside.attrs({ className: 'pt-dark' })`
  color: white;
  display: grid;
  font-family: tenso;
  grid-area: value-proposition;
  grid-gap: 1.5em;
  grid-template-columns: repeat(3, 1fr);
  hyphens: auto;
  margin-bottom: 1.5em;

  @media (max-width: 700px) {
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
