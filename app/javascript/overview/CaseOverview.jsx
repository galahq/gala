/**
 * @providesModule CaseOverview
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import TableOfContents from './TableOfContents'
import Billboard from './Billboard'
import EnrollForm from './EnrollForm'
import Tracker from 'utility/Tracker'

import type { ContextRouter } from 'react-router-dom'
import type { State, ReaderState } from 'redux/state'

type StateProps = {
  editing: boolean,
  reader: ?ReaderState,
  signInForm: ?string,
}
function mapStateToProps ({ caseData, edit }: State): StateProps {
  return {
    editing: edit.inProgress,
    reader: caseData.reader,
    signInForm: window.caseData.signInForm,
  }
}

type Props = StateProps & ContextRouter
const CaseOverview = ({ editing, location, reader, signInForm }: Props) => {
  return (
    <div id="CaseOverview" className={`window ${editing ? 'editing' : ''}`}>
      <Billboard />
      <aside className="CaseOverviewRight">
        {location.pathname === '/' && (
          <Tracker
            timerState="RUNNING"
            targetKey={`overview`}
            targetParameters={{ name: 'read_overview' }}
          />
        )}
        {signInForm != null ? (
          <div
            className="dialog"
            dangerouslySetInnerHTML={{ __html: signInForm }}
          />
        ) : reader && !reader.enrollment ? (
          <EnrollForm />
        ) : null}
        <TableOfContents />
      </aside>
    </div>
  )
}

export default connect(mapStateToProps, () => {})(CaseOverview)
