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
import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'

function mapStateToProps ({ caseData, edit }) {
  return {
    editing: edit.inProgress,
    reader: caseData.reader,
  }
}

const CaseOverview = ({ editing, trackOverview, reader }) => {
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
            {trackOverview && (
              <Tracker
                timerState="RUNNING"
                autoLogAfterMs={3000}
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
