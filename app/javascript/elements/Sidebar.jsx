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


type StateProps = {
  signInForm: ?string
}

function mapStateToProps (state) {
  if (state.caseData.reader) {
    return {
      readerEnrolled: !!state.caseData.reader.enrollment,
      signInForm: window.caseData.signInForm
    }
  }
  else {
    return {
      signInForm: window.caseData.signInForm
    }
  }
}

const Sidebar = ({ editing, readerEnrolled, location, signInForm }) => {
  return (
    <Container data-active={location.pathname}>
      <BillboardTitle minimal />
      {editing || <CommunityChooser rounded />}
      <TableOfContents onSidebar />
    </Container>
  )
}

export default withRouter(connect(mapStateToProps)(Sidebar))

// $FlowFixMe
export const Container = styled.aside.attrs({ id: 'Sidebar' })``
