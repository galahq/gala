/**
 * @providesModule EnrollForm
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

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
  <div className="CaseOverview--enroll-form">
    <h2>
      <FormattedMessage id="enrollments.new.enrollinThisCase" />
    </h2>
    <p>
      <FormattedMessage id="enrollments.new.enrollForEasyAccess" />
    </p>
    <button
      className="o-button pt-button"
      onClick={() => enrollReader(readerId, caseSlug)}
    >
      <FormattedMessage id="enrollments.new.enroll" />
    </button>
  </div>
)

export default connect(mapStateToProps, { enrollReader })(EnrollForm)
