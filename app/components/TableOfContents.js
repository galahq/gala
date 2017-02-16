import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage } from 'react-intl'
import {EditableList} from 'EditableList.js'

function mapStateToProps(state) {
  return {
    editing: state.edit.inProgress,
    pageTitles: state.caseData.pageIds.map( id => state.pagesById[id].title ),
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
        <h4 className="list-head">
          <FormattedMessage id="case.toc" />
        </h4>
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

export default connect(mapStateToProps)(injectIntl(TableOfContents))
