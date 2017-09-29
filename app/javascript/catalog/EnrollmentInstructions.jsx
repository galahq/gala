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
      <FormattedMessage
        id="catalog.chooseForYourself"
        defaultMessage="Choose for yourself"
      />
    </h5>
    <ul>
      <li>
        <FormattedMessage
          id="catalog.meetStakeholders"
          defaultMessage="Meet different stakeholders and dive deep with a multimodal narrative."
        />
      </li>
      <li>
        <FormattedMessage
          id="catalog.shortcutExperience"
          defaultMessage="Shortcut experience by putting principles into practice."
        />
      </li>
      <li>
        <FormattedMessage
          id="catalog.joinConversation"
          defaultMessage="Join the conversation by asking questions and paying your learning forward."
        />
      </li>
    </ul>
    <FormattedMessage
      id="catalog.enrollmentsInstruction"
      defaultMessage="Cases you enroll in will be presented here for easy access."
    />
  </Container>
)

export default injectIntl(EnrollmentInstructions)

const Container = styled.div.attrs({ className: 'pt-callout' })`
  margin-top: 1.5em;
  line-height: 1.4;
`
