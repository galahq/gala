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
import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'

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
    <ContentItemSelectionContextConsumer>
      {({ selecting }) => (
        <Container editing={editing}>
          <Billboard />
          <aside className="CaseOverviewRight">
            {reader && !reader.enrollment ? (
              <EnrollForm />
            ) : null}
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
      )}
    </ContentItemSelectionContextConsumer>
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
