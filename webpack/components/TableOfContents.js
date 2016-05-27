import React from 'react'
import { Link } from 'react-router'
import { I18n } from './I18n.js'

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
        <h4 className="list-head"><I18n meaning="table_of_contents" /></h4>
        <ol>
          {this.renderChapterTitles()}
        </ol>
      </div>
    )
  }
}

export default TableOfContents
