import React from 'react'
import { connect } from 'react-redux'
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
    <h2>Enroll in this case</h2>
    <p>
      If this case catches your eye, enroll for easy access from “My Cases.”
    </p>
    <button
      className="o-button pt-button"
      onClick={() => enrollReader(readerId, caseSlug)}
    >
      Enroll
    </button>
  </div>
)

export default connect(mapStateToProps, { enrollReader })(EnrollForm)
