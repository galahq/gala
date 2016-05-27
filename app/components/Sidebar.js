import React from 'react'
import { Link } from 'react-router'
import BillboardTitle from './BillboardTitle.js'

import '../stylesheets/Sidebar.scss';

import TableOfContents from './TableOfContents.js'

class Sidebar extends React.Component {
  renderTOC() {
    if (this.props.chapterTitles) {
      return (
        <TableOfContents caseID={this.props.caseID} chapterTitles={this.props.chapterTitles} chapter={this.props.chapter}/>
      )
    }
  }
  render () {
    let {title, caseID, metadata} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/read/${caseID}`} className="backLink">
          Back to overview
        </Link>
        <BillboardTitle title={title} featuredImageURL={metadata.featuredImageURL} />
        {this.renderTOC()}
      </aside>
    )
  }
}

export default Sidebar
