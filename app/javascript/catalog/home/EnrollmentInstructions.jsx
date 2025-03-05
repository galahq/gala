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
      <FormattedMessage id="catalog.yourLibrary" />
    </h5>
    <ul>
      <li>
        <FormattedMessage id="catalog.enrollmentsInstruction" />
      </li>
      <li>
        <FormattedMessage id="catalog.readingListInstruction" />
      </li>
    </ul>
  </Container>
)

export default injectIntl(EnrollmentInstructions)

const Container = styled.div.attrs({ className: 'bp3-callout' })`
  margin-top: 1.5em;
  line-height: 1.4;
`
