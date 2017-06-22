// flow-typed signature: 7f853af7ff8433de0163f8db6bfa9b8a
// flow-typed version: <<STUB>>/react-sortable-hoc_v^0.6.3/flow_v0.38.0

type FunctionComponent<P> = (props: P) => ?React$Element<any>
type ClassComponent<D, P, S> = Class<React$Component<D, P, S>>

type Config = { withRef?: boolean }
type ElementProps = {
  index: number,
  collection?: number | string,
  disabled?: boolean
}

type Axis = 'x' | 'y' | 'xy'
type ContainerProps<Item> = {
  axis?: Axis,
  lockAxis?: Axis,
  helperClass?: string,
  transitionDuration?: number,
  pressDelay?: number,
  pressThreshold?: number,
  distance?: number,
  shouldCancelStart?: (e: SyntheticEvent) => boolean,
  onSortStart?: ({node: HTMLElement, index?: number, collection: Item[]}) => void,
  onSortMove?: (e: SyntheticMouseEvent) => void,
  onSortEnd?: ({oldIndex: number, newIndex: number, collection: Item[]}, SyntheticEvent) => void,
  useDragHandle?: boolean,
  useWindowAsScrollContainer?: boolean,
  hideSortableGhost?: boolean,
  lockToContainerEdges?: boolean,
  lockOffset?: number | string,  // CSS-style string made up of number and unit
  getContainer?: React$Element<any> => HTMLElement,
  getHelperDimensions?: ({node: HTMLElement, index: number, collection: Item[]}) => { width: number, height: number}
}

declare module 'react-sortable-hoc' {
  declare export function SortableHandle <P> (FunctionComponent<P>, ?Config): ClassComponent<void, P, {}>

  declare export function SortableElement <P> (FunctionComponent<P & ElementProps>, ?Config): ClassComponent<void, P & ElementProps, {}>

  declare export function SortableContainer <P, Item> (FunctionComponent<P & ContainerProps<Item>>, ?Config): ClassComponent<void, P & ContainerProps<Item>, {}>

  declare export function arrayMove <Item> (array: Item[], previousIndex: number, nextIndex: number): Item[]
}
