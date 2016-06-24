import React from 'react'
import { Link } from 'react-router'
import BillboardTitle from './BillboardTitle.js'
import {I18n} from './I18n.js'

import TableOfContents from './TableOfContents.js'

class Sidebar extends React.Component {
  renderTOC() {
    if (this.props.segmentTitles) {
      return (
        <TableOfContents
          segmentTitles={this.props.segmentTitles}
          selectedSegment={this.props.selectedSegment}
          handleEdit={this.props.handleEdit}
        />
      )
    }
  }
  render () {
    let {title, coverURL} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/${this.props.handleEdit !== null ? "edit/" : ""}`} className="backLink">
          <I18n meaning="back_to_overview" />
        </Link>
        <BillboardTitle title={title} coverURL={coverURL} />
        {this.renderTOC()}
      </aside>
    )
  }
}

export default Sidebar
