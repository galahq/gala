import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import BillboardTitle from 'BillboardTitle.js'
import { FormattedMessage } from 'react-intl'
import TableOfContents from 'TableOfContents.js'
import EnrollForm from 'EnrollForm.js'

function mapStateToProps(state) {
  return {
    commentThreadsOpen: !!state.ui.commentThreadsOpenForCard,
    commentsOpen: !!state.ui.selectedCommentThread,
    readerEnrolled: !!state.caseData.reader.enrollment,
  }
}

const Sidebar = ({commentThreadsOpen, commentsOpen, readerEnrolled, slug,
  pageTitles, selectedPage, didSave}) => {

  const _getClassNames = () => {
    let n = []
    if (commentThreadsOpen)  n = [...n, "has-comment-threads-open"]
    if (commentsOpen)  n = [...n, "has-comments-open"]
    return n.join(' ')
  }

  return <aside id="Sidebar" className={_getClassNames()}>
    <Link to="/" className="backLink">
      <FormattedMessage id="case.backToOverview" />
    </Link>
    <BillboardTitle minimal />
    <TableOfContents />

  { readerEnrolled || <div style={{paddingTop: '1em'}}>
    <EnrollForm />
  </div>
  }

</aside>
}

export default connect(mapStateToProps)(Sidebar)
