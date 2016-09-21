import React from 'react'
import { Link } from 'react-router'
import BillboardTitle from 'BillboardTitle.js'
import {I18n} from 'I18n.js'

import TableOfContents from 'TableOfContents.js'

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

  render () {
    let {slug, kicker, title, coverUrl, didSave} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/${this.props.didSave !== null ? "edit/" : ""}`} className="backLink">
          <I18n meaning="back_to_overview" />
        </Link>
        <BillboardTitle kicker={kicker} title={title} coverUrl={coverUrl} didSave={didSave} slug={slug} />
        {this.renderTOC()}
      </aside>
    )
  }
}

export default Sidebar
