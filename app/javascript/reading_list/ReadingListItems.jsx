/**
 * @providesModule ReadingListItems
 * @flow
 */

import * as React from 'react'
import produce from 'immer'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import mergeRefs from 'utility/mergeRefs'

import ReadingListItem from 'reading_list/ReadingListItem'
import { reorder } from 'shared/functions'

import type { IntlShape } from 'react-intl'
import type { Case, ReadingListItem as ReadingListItemT } from 'redux/state'

type Props = {
  cases: { string: Case },
  intl: IntlShape,
  items: ReadingListItemT[],
  lastItemRef: any => void,
  onSetItems: (ReadingListItemT[]) => void,
}

function ReadingListItems ({
  cases,
  intl,
  items,
  lastItemRef,
  onSetItems,
}: Props) {
  if (items.length === 0) return null

  return (
    <DragDropContext
      onDragEnd={({ source, destination }) => {
        if (!destination) return

        onSetItems(reorder(source.index, destination.index, items))
      }}
    >
      <Droppable droppableId="ReadingList">
        {droppable => (
          <Container ref={droppable.innerRef} {...droppable.droppableProps}>
            {items.map((item, index) => {
              const caseData = cases[item.caseSlug]

              return (
                <Draggable
                  draggableId={`ReadingListItem-${item.caseSlug}`}
                  index={index}
                  key={item.caseSlug}
                >
                  {draggable => (
                    <ReadingListItem
                      ref={mergeRefs(draggable.innerRef, lastItemRef)}
                      intl={intl}
                      item={item}
                      caseData={caseData}
                      {...draggable.draggableProps}
                      {...draggable.dragHandleProps}
                      onChange={item => {
                        onSetItems(
                          produce(items, draft => {
                            draft[index] = item
                          })
                        )
                      }}
                      onDelete={() => {
                        onSetItems(
                          produce(items, draft => {
                            draft.splice(index, 1)
                          })
                        )
                      }}
                    />
                  )}
                </Draggable>
              )
            })}
            {droppable.placeholder}
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default injectIntl(ReadingListItems)

const Container = styled.ul`
  list-style: none;
  padding: 0;
`
