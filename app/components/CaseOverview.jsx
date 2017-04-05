import React from 'react'
import { connect } from 'react-redux'

import TableOfContents from 'TableOfContents.js'
import Billboard from 'Billboard.js'
import EnrollForm from 'EnrollForm.js'

const CaseOverview = ({editing, signInForm, reader}) => {
  return <div id="CaseOverview" className={`window ${editing && 'editing'}`}>
    <Billboard />
    <aside className="CaseOverviewRight">
      { signInForm !== undefined
        ? <div className="dialog" dangerouslySetInnerHTML={{__html: signInForm}} />
        : (!reader.enrollment ? <EnrollForm /> : null)
      }
      <TableOfContents />
    </aside>
  </div>
}

export default connect(
  state => ({
    reader: state.caseData.reader,
    signInForm: window.caseData.signInForm,
    editing: state.edit.inProgress,
  })
)(CaseOverview)
