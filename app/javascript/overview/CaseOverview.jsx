/**
 * @providesModule CaseOverview
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import TableOfContents from './TableOfContents'
import Billboard from './Billboard'
import EnrollForm from './EnrollForm'
import Tracker from 'utility/Tracker'
import { SignInFormContainer } from 'utility/SignInForm'
import CommunityChooser from 'overview/CommunityChooser'

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
    <Container editing={editing}>
      <Billboard />
      <aside className="CaseOverviewRight">
        {signInForm != null ? (
          <SignInFormContainer formContents={signInForm} />
        ) : reader && !reader.enrollment ? (
          <EnrollForm />
        ) : (
          <CommunityChooser rounded />
        )}
        <TableOfContents />
        {location.pathname === '/' && (
          <Tracker
            timerState="RUNNING"
            targetKey={`overview`}
            targetParameters={{ name: 'read_overview' }}
          />
        )}
      </aside>
    </Container>
  )
}

// $FlowFixMe
export default connect(mapStateToProps)(CaseOverview)

const Container = styled.div.attrs(p => ({
  id: 'CaseOverview',
  className: `window ${p.editing ? 'editing' : ''}`,
}))`
  & .devise-card {
    width: auto;
  }
`
