/**
 * @providesModule GalaDragDropContext
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-beautiful-dnd'

import { reorderCaseElements, reorderCard } from 'redux/actions'

type Props = {
  children: React.Node,
  reorderCaseElements: typeof reorderCaseElements,
  reorderCard: typeof reorderCard,
}

function GalaDragDropContext ({
  children,
  reorderCaseElements,
  reorderCard,
}: Props) {
  function onDragEnd (result) {
    const { draggableId, type, source, destination } = result

    switch (type) {
      case 'CaseElement': {
        if (!destination) return

        reorderCaseElements(source.index, destination.index)
        break
      }

      case 'Page': {
        if (!destination) return

        const [, cardId] = draggableId.split('/')
        reorderCard(cardId, destination.index)
        break
      }
    }
  }

  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}

export default connect(
  null,
  { reorderCaseElements, reorderCard }
)(GalaDragDropContext)
