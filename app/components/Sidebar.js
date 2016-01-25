import React from 'react'
import { Link } from 'react-router'

import '../stylesheets/Sidebar.scss';

class Sidebar extends React.Component {
  render () {
    let {title, caseID, chapterTitles, chapter} = this.props
    return (
      <aside id="Sidebar">
        <Headline caseTitle={title}/>
        <TableOfContents caseID={caseID} chapterTitles={chapterTitles} chapter={chapter}/>
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

class TableOfContents extends React.Component {
  renderChapterTitles() {
    let titleList = this.props.chapterTitles.map( (title, idx) => {
      return(
        <li key={idx} className={idx === parseInt(this.props.chapter) ? "focus" : ""}>
          <Link to={`/read/${this.props.caseID}/${idx}`}>{title}</Link>
        </li>
      )
    } )
    return titleList
  }
  render() {
    return(
      <div id="TableOfContents">
        <h4>Table of Contents</h4>
        <ol>
          {this.renderChapterTitles()}
        </ol>
      </div>
    )
  }
}
