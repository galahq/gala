import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { I18n } from 'I18n.js'
import {EditableList} from 'EditableList.js'

function mapStateToProps(state) {
  return {
    editing: state.edit.inProgress,
    pageTitles: state.caseData.pageIds.map( id => state.pagesById[id].title )
  }
}

class TableOfContents extends React.Component {
  renderChapterLinks() {
    let titleList = this.props.pageTitles.map( (title, idx) => {
      return(
        <Link to={`${this.props.didSave !== null ? "/edit/" : ""}${idx + 1}`}>{title}</Link>
      )
    } )
    return titleList
  }

  render() {
    return(
      <div id="TableOfContents">
        <h4 className="list-head"><I18n meaning="table_of_contents" /></h4>
        <EditableList
          elements={this.renderChapterLinks()}
          ordered={true}
          selectedIndex={this.props.selectedPage}
          selectedClass="focus"
          uri={`cases/${this.props.slug}/pages`}
          didSave={this.props.didSave}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps)(TableOfContents)
