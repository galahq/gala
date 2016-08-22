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
          pageTitles={this.props.pageTitles}
          selectedPage={this.props.selectedPage}
          handleEdit={this.props.handleEdit}
        />
      )
    }
  }
  render () {
    let {kicker, title, coverUrl, handleEdit} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/${this.props.handleEdit !== null ? "edit/" : ""}`} className="backLink">
          <I18n meaning="back_to_overview" />
        </Link>
        <BillboardTitle kicker={kicker} title={title} coverUrl={coverUrl} handleEdit={handleEdit} />
        {this.renderTOC()}
      </aside>
    )
  }
}

export default Sidebar
