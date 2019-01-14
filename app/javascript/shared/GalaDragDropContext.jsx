/**
 * @providesModule GalaDragDropContext
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-beautiful-dnd'

import {
  moveCardToNewPage,
  moveCardToExistingPage,
  reorderCaseElements,
  reorderCard,
} from 'redux/actions'

import type { State } from 'redux/state'

type Props = {
  children: React.Node,
  moveCardToExistingPage: typeof moveCardToExistingPage,
  moveCardToNewPage: typeof moveCardToNewPage,
  reorderCaseElements: typeof reorderCaseElements,
  reorderCard: typeof reorderCard,
}

function GalaDragDropContext ({
  children,
  moveCardToExistingPage,
  moveCardToNewPage,
  reorderCaseElements,
  reorderCard,
}: Props) {
  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>

  function onDragEnd (result) {
    const { draggableId, source, destination } = result
    const [table, param] = draggableId.split('/')

    switch (table) {
      case 'caseElements': {
        if (!destination) return

        reorderCaseElements(source.index, destination.index)
        break
      }

      case 'cards': {
        handleCardDragEnd(param, result)
        break
      }
    }
  }

  function handleCardDragEnd (cardId, result) {
    const { destination } = result

    if (destination && destination.droppableId.match(/^pages/)) {
      reorderCard(cardId, destination.index)
    } else {
      moveCard(cardId, result)
    }
  }

  function moveCard (cardId, { destination, combine }) {
    if (destination) {
      moveCardToNewPage(cardId, destination.index)
    } else if (combine) {
      moveCardToExistingPage(cardId, combine.draggableId)
    }
  }
}

export default connect(
  null,
  {
    moveCardToNewPage,
    moveCardToExistingPage,
    reorderCaseElements,
    reorderCard,
  }
)(GalaDragDropContext)
