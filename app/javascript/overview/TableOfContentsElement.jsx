/**
 * @providesModule TableOfContentsElement
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { Draggable } from 'react-beautiful-dnd'

import Icon from 'utility/Icon'
import {
  Item,
  Link,
  Label,
  Details,
  ElementIcon,
} from 'table_of_contents/shared'

import { updateCaseElement, persistCaseElementReordering } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'
import type { State, CaseElement } from 'redux/state'

type Element = { title: string, typeIcon: ?React.Node }
function getElementDataFrom (state: State) {
  return ({ elementStore: store, elementId: id }): Element => {
    const { title, iconSlug } = state[store][id]
    const typeIcon = iconSlug && <Icon filename={iconSlug} />

    return { title, typeIcon }
  }
}

type OwnProps = {|
  ...ContextRouter,
  caseElement: CaseElement,
  position: number,
  readOnly: boolean,
|}
function mapStateToProps (state: State, { caseElement, position }: OwnProps) {
  return {
    caseElement,
    position,
    element: getElementDataFrom(state)(caseElement),
    editing: state.edit.inProgress,
    loggedIn: !!state.caseData.reader,
  }
}

type Props = {
  ...OwnProps,
  caseElement: CaseElement,
  element: Element,
  editing: boolean,
  loggedIn: boolean,
}
function TableOfContentsElement ({
  caseElement,
  position,
  element,
  editing,
  readOnly,
  loggedIn,
}: Props) {
  return (
    <Draggable
      draggableId={caseElement.id}
      index={position}
      isDragDisabled={readOnly || !editing}
    >
      {(provided, snapshot) => (
        <Item ref={provided.innerRef} {...provided.draggableProps}>
          <Link
            data-is-dragging={snapshot.isDragging}
            to={`/${position + 1}`}
            as={undefined}
          >
            <Label {...provided.dragHandleProps}>
              {editing && !readOnly ? (
                <span className="pt-icon pt-icon-drag-handle-horizontal" />
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

// $FlowFixMe
export default withRouter(
  connect(
    mapStateToProps,
    { updateCaseElement, persistCaseElementReordering }
  )(TableOfContentsElement)
)
