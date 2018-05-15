import React from 'react'
import { connect } from 'react-redux'
import { withRouter, matchPath } from 'react-router-dom'
import BillboardTitle from 'overview/BillboardTitle'
import CommunityChooser from 'overview/CommunityChooser'
import TableOfContents from 'overview/TableOfContents'
import EnrollForm from 'overview/EnrollForm'
import { commentThreadsOpen, commentsOpen } from 'shared/routes'

function mapStateToProps (state, { location }) {
  const { pathname } = location

  return {
    commentThreadsOpen: matchPath(pathname, commentThreadsOpen()),
    commentsOpen: matchPath(pathname, commentsOpen()),
    readerEnrolled: !!state.caseData.reader.enrollment,
  }
}

const Sidebar = ({
  commentThreadsOpen,
  commentsOpen,
  editing,
  readerEnrolled,
}) => {
  const _getClassNames = () => {
    let n = []
    if (commentThreadsOpen) n = [...n, 'has-comment-threads-open']
    if (commentsOpen) n = [...n, 'has-comments-open']
    return n.join(' ')
  }

  return (
    <aside id="Sidebar" className={_getClassNames()}>
      <BillboardTitle minimal />
      {editing || <CommunityChooser rounded />}
      <TableOfContents onSidebar />

      {readerEnrolled || (
        <div style={{ paddingTop: '1em' }}>
          <EnrollForm />
        </div>
      )}
    </aside>
  )
}

export default withRouter(connect(mapStateToProps)(Sidebar))
