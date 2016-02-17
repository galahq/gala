import React from 'react'
import { Link } from 'react-router'

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
    let {title, caseID} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/read/${caseID}`} className="backLink">
          Back to overview
        </Link>
        <Headline caseTitle={title}/>
        {this.renderTOC()}
      </aside>
    )
  }
}

export default Sidebar

class Headline extends React.Component {
  render() { return (
    <div id="Headline">
      <h2>{this.props.caseTitle}</h2>
    </div>
  ) }
}
