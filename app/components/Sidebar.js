import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BillboardTitle from 'BillboardTitle.js'
import { FormattedMessage } from 'react-intl'
import TableOfContents from 'TableOfContents.js'
import {EnrollForm} from 'EnrollForm.js'

class Sidebar extends React.Component {
  constructor(props) {
    super(props)

    this._getClassNames = () => {
      let n = []
      if (this.props.commentThreadsOpen)  n = [...n, "has-comment-threads-open"]
      if (this.props.commentsOpen)  n = [...n, "has-comments-open"]
      return n.join(' ')
    }
  }
  renderTOC() {
    if (this.props.pageTitles) {
      return (
        <TableOfContents
          slug={this.props.slug}
          pageTitles={this.props.pageTitles}
          selectedPage={this.props.selectedPage}
          didSave={this.props.didSave}
        />
      )
    }
  }

  renderEnrollForm() {
    if (!this.props.reader.enrollment) {
      return <div style={{paddingTop: '1em'}}>
        <EnrollForm enrolled={this.props.enrolled} readerId={this.props.reader.id} caseSlug={this.props.slug} />
      </div>
    }
  }

  render () {
    return (
      <aside id="Sidebar" className={this._getClassNames()}>
        <Link to="/" className="backLink">
          <FormattedMessage id="case.backToOverview" />
        </Link>
        <BillboardTitle minimal />
        {this.renderTOC()}
        {this.renderEnrollForm()}
      </aside>
    )
  }
}

export default connect(
  (state) => ({
    commentThreadsOpen: !!state.ui.commentThreadsOpenForCard,
    commentsOpen: !!state.ui.selectedCommentThread,
  })
)(Sidebar)
