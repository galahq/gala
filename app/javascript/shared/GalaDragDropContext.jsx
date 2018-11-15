/**
 * @providesModule GalaDragDropContext
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-beautiful-dnd'

import { reorderCaseElements } from 'redux/actions'

type Props = {
  children: React.Node,
  reorderCaseElements: typeof reorderCaseElements,
}

function GalaDragDropContext ({ children, reorderCaseElements }: Props) {
  function onDragEnd (result) {
    const { source, destination } = result
    if (!destination) return

    reorderCaseElements(source.index, destination.index)
  }

  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}

export default connect(
  null,
  { reorderCaseElements }
)(GalaDragDropContext)
