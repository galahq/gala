/**
 * @providesModule SortableList
 * @flow
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

import type { IntlShape } from 'react-intl'

type ItemProps<Item> = ChildProps<Item> & {
  render: React.ComponentType<Item>,
  onRemove: () => void,
}
type ContainerProps<Item> = {
  items: Item[],
  newItem: Item,
  render: React.ComponentType<Item>,
  onChange: (Item[]) => void,
}

// Use SortableList as a component with these props:
type Props<Item> = {
  // A function that renders one Item. It will be called with ChildProps.
  render: React.ComponentType<Item>,

  // An array of items that make up the SortableList. Each element will be
  // passed to children as item so that its contents may be rendered.
  items: Item[],

  // An example of a "blank" or "new" item to be added when the user presses the
  // "Add item" button
  newItem: Item,

  // Your chance to handle any change to the list. You will be called with a
  // changed copy of items.
  onChange: (Item[]) => void,

  // So the elements don’t change theme while being dragged
  dark?: boolean,
}

// The props with which the `render` props of SortableList will be called
type ChildProps<Item> = {
  // The item that this child should render
  item: Item,

  // The index of this child in the array (for numbering, etc.)
  index: number,

  // A function which takes a modified copy of the child to replace it.
  onChangeItem: Item => void,
}

const Handle = SortableHandle(() => (
  <span
    className="bp3-button bp3-icon-drag-handle-horizontal bp3-fixed"
    style={{ marginRight: -3 }}
  />
))

const Item = SortableElement(
  ({ item, index, render: Render, onChangeItem, onRemove }: ItemProps<*>) => (
    <div className="bp3-control-group bp3-fill" style={{ marginBottom: '0.5em' }}>
      <Handle />

      <Render item={item} index={index} onChangeItem={onChangeItem} />

      <Button
        className="bp3-fixed"
        intent={Intent.DANGER}
        icon="delete"
        onClick={onRemove}
      />
    </div>
  )
)

// $FlowFixMe
const Container = SortableContainer(
  ({ newItem, items, render, onChange }: ContainerProps<*>) => (
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

const SortableList = (props: Props<*>) => (
  <Container
    {...props}
    useDragHandle={true}
    transitionDuration={100}
    helperClass={`sortable-helper${props.dark ? ' bp3-dark' : ''}`}
    onSortEnd={({ oldIndex, newIndex }) =>
      props.onChange(arrayMove(props.items, oldIndex, newIndex))
    }
  />
)

export default SortableList

export function createSortableInput ({
  placeholderId,
  ...props
}: { placeholderId?: string } = {}) {
  const SortableInput = ({
    intl,
    item,
    onChangeItem,
  }: ChildProps<string> & { intl: IntlShape }) => (
    <input
      className="bp3-input"
      type="text"
      placeholder={placeholderId && intl.formatMessage({ id: placeholderId })}
      {...props}
      value={item}
      onChange={(e: SyntheticInputEvent<*>) => onChangeItem(e.target.value)}
    />
  )
  return injectIntl(SortableInput)
}
