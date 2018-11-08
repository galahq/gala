/**
 * @providesModule EnrollmentInstructions
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

const EnrollmentInstructions = () => (
  <Container>
    <h5>
      <FormattedMessage id="catalog.chooseForYourself" />
    </h5>
    <ul>
      <li>
        <FormattedMessage id="catalog.meetStakeholders" />
      </li>
      <li>
        <FormattedMessage id="catalog.shortcutExperience" />
      </li>
      <li>
        <FormattedMessage id="catalog.joinConversation" />
      </li>
    </ul>
    <FormattedMessage id="catalog.enrollmentsInstruction" />
  </Container>
)

export default injectIntl(EnrollmentInstructions)

const Container = styled.div.attrs({ className: 'pt-callout' })`
  margin-top: 1.5em;
  line-height: 1.4;
`
