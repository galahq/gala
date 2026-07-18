/**
 * @providesModule CaseOverview
 *
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import TableOfContents from './TableOfContents'
import Billboard from './Billboard'
import EnrollForm from './EnrollForm'
import Tracker from 'utility/Tracker'
import { SignInFormContainer } from 'utility/SignInForm'
import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'


function mapStateToProps ({ caseData, edit }) {
  return {
    editing: edit.inProgress,
    reader: caseData.reader,
    signInForm: window.caseData.signInForm,
  }
}

const CaseOverview = ({ editing, location, reader, signInForm }) => {
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

export default connect(mapStateToProps)(CaseOverview)

const Container = styled.div.attrs(p => ({
  id: 'CaseOverview',
  className: `window ${p.editing ? 'editing' : ''}`,
}))`
  & .devise-card {
    width: auto;
  }
`
