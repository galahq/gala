import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DropTarget, DragDropContext } from 'react-dnd'

import { createPage, createPodcast, createActivity } from 'redux/actions.js'

import { ItemTypes } from 'concerns/dndConfig.js'
import TableOfContentsElement from 'TableOfContentsElement.js'

function mapStateToProps(state) {
  return {
    caseSlug: state.caseData.slug,
    elements: state.caseData.caseElements,
    disabled: !state.caseData.reader,
    editing: state.edit.inProgress,
  }
}

const mapDispatchToProps = { createPage, createPodcast, createActivity }

const TableOfContents = ({caseSlug, editing, elements, disabled,
  connectDropTarget, readOnly, createPage, createPodcast, createActivity}) =>
  <nav className={`c-toc ${disabled && "c-toc--disabled"}`}>
    <h3 className="c-toc__header"><FormattedMessage id="case.toc" /></h3>
    { connectDropTarget(
      <ol className="c-toc__list">
        { elements.map((element, index) =>
          <TableOfContentsElement element={element} key={element.id}
            position={index + 1} readOnly={readOnly}/>
        ) }
        { editing && <div className="c-toc__actions pt-control-group">
          <button type="button" className="pt-button pt-icon-add pt-minimal"
            onClick={() => createPage(caseSlug)}
          >
            Page
          </button>
          <button type="button" className="pt-button pt-icon-add pt-minimal"
            onClick={() => createPodcast(caseSlug)}
          >
            Podcast
          </button>
          <button type="button" className="pt-button pt-icon-add pt-minimal"
            onClick={() => createActivity(caseSlug)}
          >
            Activity
          </button>
        </div> }
      </ol>
    ) }
  </nav>

const DragDropTableOfContents = DragDropContext(HTML5Backend)(
  DropTarget(
    ItemTypes.CASE_ELEMENT,
    { drop: () => {} },
    connect => ({ connectDropTarget: connect.dropTarget() })
  )(
    TableOfContents
  )
)

export default withRouter(
  connect( mapStateToProps, mapDispatchToProps)(DragDropTableOfContents)
)
