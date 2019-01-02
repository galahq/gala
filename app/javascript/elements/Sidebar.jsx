/**
 * @flow
 * @providesModule Sidebar
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import BillboardTitle from 'overview/BillboardTitle'
import CommunityChooser from 'overview/CommunityChooser'
import TableOfContents from 'overview/TableOfContents'
import EnrollForm from 'overview/EnrollForm'

function mapStateToProps (state) {
  return {
    readerEnrolled: !!state.caseData.reader.enrollment,
  }
}

const Sidebar = ({ editing, readerEnrolled, location }) => {
  return (
    <Container data-active={location.pathname}>
      <BillboardTitle minimal />
      {editing || <CommunityChooser rounded />}
      <TableOfContents onSidebar />

      {readerEnrolled || (
        <div style={{ paddingTop: '1em' }}>
          <EnrollForm />
        </div>
      )}
    </Container>
  )
}

export default withRouter(connect(mapStateToProps)(Sidebar))

export const Container = styled.aside.attrs({ id: 'Sidebar' })``
