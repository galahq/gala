/**
 * @providesModule EnrollForm
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'

import { enrollReader } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps ({ caseData }: State) {
  const { slug: caseSlug, reader } = caseData
  if (!reader) throw Error('This should never happen.')
  const { id: readerId } = reader
  return {
    caseSlug,
    readerId,
  }
}

const EnrollForm = ({ caseSlug, readerId, enrollReader }) => (
  <ContentItemSelectionContextConsumer>
    {({ selecting }) =>
      selecting || (
        <Container>
          <h2>
            <FormattedMessage id="enrollments.new.enrollInThisCase" />
          </h2>
          <p>
            <FormattedMessage id="enrollments.new.enrollForEasyAccess" />
          </p>
          <button
            className="bp3-button bp3-intent-primary"
            onClick={() => enrollReader(readerId, caseSlug)}
          >
            <FormattedMessage id="enrollments.new.enroll" />
          </button>
        </Container>
      )
    }
  </ContentItemSelectionContextConsumer>
)

// $FlowFixMe
export default connect(
  mapStateToProps,
  { enrollReader }
)(EnrollForm)

const Container = styled.div.attrs({
  className: 'devise-card bp3-card bp3-elevation-3',
})`
  border-width: 0 0 5px;
  padding: 20px;
  width: unset;
`
