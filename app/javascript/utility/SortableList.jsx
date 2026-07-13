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
    className="bp6-button bp6-icon-drag-handle-horizontal bp6-fixed"
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
                    className={`bp6-control-group bp6-fill${
                      snapshot.isDragging
                        ? ` sortable-helper${dark ? ' bp6-dark' : ''}`
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
                      className="bp6-fixed"
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
      className="bp6-input"
      type="text"
      placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
      {...props}
      value={item}
      onChange={(e) => onChangeItem(e.target.value)}
    />
  )
  return injectIntl(SortableInput)
}
