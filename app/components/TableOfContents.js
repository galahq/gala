import React from 'react'
import { Link } from 'react-router'

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
        <h4 className="list-head">Table of Contents</h4>
        <ol>
          {this.renderChapterTitles()}
        </ol>
      </div>
    )
  }
}

export default TableOfContents
