/**
 * @providesModule TableOfContentsElement
 *
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { Draggable } from '@hello-pangea/dnd'

import Icon from 'utility/Icon'
import {
  Item,
  Link,
  Label,
  Details,
  ElementIcon,
} from 'table_of_contents/shared'

import { updateCaseElement, persistCaseElementReordering } from 'redux/actions'


function getElementDataFrom (state) {
  return ({ elementStore: store, elementId: id }) => {
    const { title, iconSlug } = state[store][id]
    const typeIcon = iconSlug && <Icon filename={iconSlug} />

    return { title, typeIcon }
  }
}

function mapStateToProps (state, { caseElement, position }) {
  return {
    caseElement,
    position,
    element: getElementDataFrom(state)(caseElement),
    editing: state.edit.inProgress,
    loggedIn: !!state.caseData.reader,
  }
}

function TableOfContentsElement ({
  caseElement,
  position,
  element,
  editing,
  readOnly,
  loggedIn,
}) {
  return (
    <Draggable
      draggableId={String(caseElement.id)}
      index={position}
      isDragDisabled={readOnly || !editing}
    >
      {(provided, snapshot) => (
        <Item ref={provided.innerRef} {...provided.draggableProps}>
          <Link
            isDragging={snapshot.isDragging}
            // to={loggedIn ? `/${position + 1}` : undefined}
            // as={loggedIn ? undefined : 'div'}
            to={`/${position + 1}`}
            as={undefined}
          >
            <Label {...provided.dragHandleProps}>
              {editing && !readOnly ? (
                <span className="bp6-icon bp6-icon-drag-handle-horizontal" />
              ) : (
                position + 1
              )}
            </Label>

            <Details>
              {element.title || (
                <FormattedMessage id="caseElements.new.untitled" />
              )}

              <ElementIcon>{element.typeIcon}</ElementIcon>
            </Details>
          </Link>
        </Item>
      )}
    </Draggable>
  )
}

export default withRouter(
  connect(
    mapStateToProps,
    { updateCaseElement, persistCaseElementReordering }
  )(TableOfContentsElement)
)
