import React from 'react'
import { connect } from 'react-redux'

import TableOfContents from 'TableOfContents'
import Billboard from 'Billboard'
import EnrollForm from 'EnrollForm'

import type { State } from 'redux/state'

const CaseOverview = ({editing, signInForm, reader}) => {
  return <div id="CaseOverview" className={`window ${editing && 'editing'}`}>
    <Billboard />
    <aside className="CaseOverviewRight">
      { signInForm != null
        ? <div
          className="dialog"
          dangerouslySetInnerHTML={{__html: signInForm}}
        />
        : (!reader.enrollment ? <EnrollForm /> : null)
      }
      <TableOfContents />
    </aside>
  </div>
}

export default connect(
  (state: State) => ({
    reader: state.caseData.reader,
    signInForm: (window.caseData.signInForm: ?string),
    editing: state.edit.inProgress,
  })
)(CaseOverview)
