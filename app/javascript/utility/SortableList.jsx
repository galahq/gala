/**
 * @providesModule SortableList
 * 
 */

import * as React from 'react'
import { Button, Intent } from '@blueprintjs/core'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { injectIntl } from 'react-intl'

import { append, update, remove, move } from 'ramda'



// Use SortableList as a component with these props:

// The props with which the `render` props of SortableList will be called

const DragHandle = (props) => (
  <span
    className="pt-button pt-icon-drag-handle-horizontal pt-fixed"
    style={{ marginRight: -3 }}
    {...props}
  />
)

const SortableList = ({ items, newItem, render: Render, onChange, dark }) => {
  const handleDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return
    onChange(move(source.index, destination.index, items))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sortable-list">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, i) => (
              <Draggable key={i} draggableId={`sortable-item-${i}`} index={i}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`pt-control-group pt-fill${
                      snapshot.isDragging
                        ? ` sortable-helper${dark ? ' pt-dark' : ''}`
                        : ''
                    }`}
                    style={{
                      marginBottom: '0.5em',
                      ...provided.draggableProps.style,
                    }}
                  >
                    <DragHandle {...provided.dragHandleProps} />

                    <Render
                      item={item}
                      index={i}
                      onChangeItem={item => onChange(update(i, item, items))}
                    />

                    <Button
                      className="pt-fixed"
                      intent={Intent.DANGER}
                      icon="delete"
                      onClick={() => onChange(remove(i, 1, items))}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <Button
        intent={Intent.SUCCESS}
        icon="add"
        text="Add"
        onClick={_ => onChange(append(newItem, items))}
      />
    </DragDropContext>
  )
}

export default SortableList

export function createSortableInput ({
  placeholderId,
  ...props
} = {}) {
  const SortableInput = ({
    intl,
    item,
    onChangeItem,
  }) => (
    <input
      className="pt-input"
      type="text"
      placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
      {...props}
      value={item}
      onChange={(e) => onChangeItem(e.target.value)}
    />
  )
  return injectIntl(SortableInput)
}
