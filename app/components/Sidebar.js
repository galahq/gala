import React from 'react'
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
    let {slug, kicker, title, coverUrl, didSave} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/${this.props.didSave !== null ? "edit/" : ""}`} className="backLink">
          <I18n meaning="back_to_overview" />
        </Link>
        <BillboardTitle kicker={kicker} title={title} coverUrl={coverUrl} didSave={didSave} slug={slug} />
        {this.renderTOC()}
        {this.renderEnrollForm()}
      </aside>
    )
  }
}

export default Sidebar
