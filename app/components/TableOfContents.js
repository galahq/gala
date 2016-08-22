import React from 'react'
import { Link } from 'react-router'
import { I18n } from 'I18n.js'

class TableOfContents extends React.Component {
  renderChapterTitles() {
    let titleList = this.props.pageTitles.map( (title, idx) => {
      return(
        <li key={idx + 1} className={idx === parseInt(this.props.selectedPage) ? "focus" : ""}>
          <Link to={`${this.props.handleEdit !== null ? "/edit/" : ""}${idx + 1}`}>{title}</Link>
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
