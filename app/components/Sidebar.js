import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BillboardTitle from 'BillboardTitle.js'
import {I18n} from 'I18n.js'
import TableOfContents from 'TableOfContents.js'
import {EnrollForm} from 'EnrollForm.js'

class Sidebar extends React.Component {
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
      <aside id="Sidebar" className={this.props.commentsOpen && "has-comments-open"}>
        <Link to="/" className="backLink">
          <I18n meaning="back_to_overview" />
        </Link>
        <BillboardTitle minimal />
        {this.renderTOC()}
        {this.renderEnrollForm()}
      </aside>
    )
  }
}

export default connect(
  (state) => ({ commentsOpen: !!state.ui.commentsOpenForCard })
)(Sidebar)
