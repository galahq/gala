/**
 * @providesModule SortableList
 * 
 */

import * as React from 'react'
import { Button, Intent } from '@blueprintjs/core'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc'
import { injectIntl } from 'react-intl'

import { append, update, remove } from 'ramda'



// Use SortableList as a component with these props:

// The props with which the `render` props of SortableList will be called

const Handle = SortableHandle(() => (
  <span
    className="pt-button pt-icon-drag-handle-horizontal pt-fixed"
    style={{ marginRight: -3 }}
  />
))

const Item = SortableElement(
  ({ item, index, render: Render, onChangeItem, onRemove }) => (
    <div className="pt-control-group pt-fill" style={{ marginBottom: '0.5em' }}>
      <Handle />

      <Render item={item} index={index} onChangeItem={onChangeItem} />

      <Button
        className="pt-fixed"
        intent={Intent.DANGER}
        icon="delete"
        onClick={onRemove}
      />
    </div>
  )
)

const Container = SortableContainer(
  ({ newItem, items, render, onChange }) => (
    <div>
      {items.map((item, i) => (
        <Item
          key={i}
          index={i}
          item={item}
          render={render}
          onChangeItem={item => onChange(update(i, item, items))}
          onRemove={() => onChange(remove(i, 1, items))}
        />
      ))}
      <Button
        intent={Intent.SUCCESS}
        icon="add"
        text="Add"
        onClick={_ => onChange(append(newItem, items))}
      />
    </div>
  )
)

const SortableList = (props) => (
  <Container
    {...props}
    useDragHandle={true}
    transitionDuration={100}
    helperClass={`sortable-helper${props.dark ? ' pt-dark' : ''}`}
    onSortEnd={({ oldIndex, newIndex }) =>
      props.onChange(arrayMove(props.items, oldIndex, newIndex))
    }
  />
)

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
