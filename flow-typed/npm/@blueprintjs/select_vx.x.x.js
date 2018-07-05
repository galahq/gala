// flow-typed signature: 1b23b6b7435a755030d68864b1de73ce
// flow-typed version: <<STUB>>/@blueprintjs/select_v2.0.1/flow_v0.72.0

import * as React from 'react'
import type { IPopoverProps, IProps, ITagInputProps } from '@blueprintjs/core'

declare module '@blueprintjs/select' {
  declare export type ItemListPredicate<T> = (query: string, items: T[]) => T[]

  declare export type ItemListRenderer<T> = (
    itemListProps: IItemListRendererProps<T>
  ) => React.Node

  declare export type ItemPredicate<T> = (
    query: string,
    item: T,
    index: number
  ) => boolean

  declare export type ItemRenderer<T> = (
    item: T,
    itemProps: IItemRendererProps<T>
  ) => React.Node

  declare export type IItemListRendererProps<T> = {
    filteredItems: T[],
    items: T[],
    itemsParentRef: (?HTMLElement) => void,
    query: string,
    renderItem: (item: T, index: number) => React.Node,
  }

  declare export type IItemModifiers = {
    active: boolean,
    disabled: boolean,
    matchesPredicate: boolean,
  }

  declare export type IItemRendererProps<T> = {
    handleClick: (SyntheticMouseEvent<*>) => mixed,
    index: number,
    modifiers: IItemModifiers,
    query: string,
  }

  declare export type IListItemsProps<T> = IProps & {
    initialContent?: React.Node,
    itemListPredicate?: ItemListPredicate<T>,
    itemListRenderer?: ItemListRenderer<T>,
    itemPredicate?: ItemPredicate<T>,
    itemRenderer: ItemRenderer<T>,
    items: T[],
    noResults?: React.Node,
    onItemSelect: (item: T, event?: SyntheticEvent<*>) => void,
  }

  declare export type IMultiSelectProps<T> = IListItemsProps<T> & {
    openOnKeyDown?: boolean,
    popoverProps?: $Shape<IPopoverProps>,
    resetOnSelect?: boolean,
    selectedItems?: T[],
    tagInputProps?: $Shape<ITagInputProps>,
    tagRenderer: T => React.Node,
  }

  declare export class MultiSelect<T> extends React.Component<
  IMultiSelectProps<T>
  > {}
}
