import React from 'react'
import { Link } from 'react-router'

import '../stylesheets/Sidebar.scss';

import TableOfContents from './TableOfContents.js'

class Sidebar extends React.Component {
  render () {
    let {title, caseID, chapterTitles, chapter} = this.props
    return (
      <aside id="Sidebar">
        <Link to={`/read/${caseID}`} className="backLink">
          Back to overview
        </Link>
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
