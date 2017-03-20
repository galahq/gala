import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router-dom'
import HTML5Backend from 'react-dnd-html5-backend'
import { DropTarget, DragDropContext } from 'react-dnd'

import { ItemTypes } from 'concerns/dndConfig.js'
import TableOfContentsElement from 'TableOfContentsElement.js'


const TableOfContents = ({elements, disabled, connectDropTarget, readOnly}) =>
  <nav className={`c-toc ${disabled && "c-toc--disabled"}`}>
    <h3 className="c-toc__header"><FormattedMessage id="case.toc" /></h3>
    { connectDropTarget(
      <ol className="c-toc__list">
        { elements.map((element) =>
          <TableOfContentsElement element={element} key={element.id}
          readOnly={readOnly}/>
        ) }
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
  connect(
    state => ({
      elements: state.caseData.caseElements,
      disabled: !state.caseData.reader,
    })
  )(DragDropTableOfContents)
)
