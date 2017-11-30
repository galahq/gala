/**
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

type State = { style: { display: 'none' | 'initial' } }
export class AccessibleAlert extends React.Component<*, State> {
  state = { style: { display: 'none' }}

  componentDidMount () {
    setInterval(() => this.setState({ style: { display: 'initial' }}), 1)
  }

  render () {
    return (
      <span role="alert" style={this.state.style}>
        {this.props.children}
      </span>
    )
  }
}

export const LabelForScreenReaders = styled.div`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;

  &:focus-within {
    position: initial;
    left: initial;
    top: initial;
    width: initial;
    height: initial;
    overflow: initial;
  }

  ${({ visibleBelowMaxWidth }) =>
    visibleBelowMaxWidth &&
    css`
      @media (max-width: ${visibleBelowMaxWidth}px) {
        position: initial;
        left: initial;
        top: initial;
        width: initial;
        height: initial;
        overflow: initial;
      }
    `};
`

/**
 * A list which keeps its elements sorted by priority (higher numbers win)
 */
type ListValue<T> = {
  priority: number,
  value: T,
}
class SortedList<T> {
  static _compareFunction = (a, b) => (a.priority > b.priority ? -1 : 1)

  _data: Array<ListValue<T>>

  constructor (initialData: Array<ListValue<T>> = []) {
    this._data = initialData.sort(this.constructor._compareFunction)
  }

  get first () {
    return this._data[0].value
  }

  insert (value: T, priority: number) {
    const i = this._data.findIndex(
      x => this.constructor._compareFunction({ priority, value }, x) === -1
    )

    if (i === -1) this._data.push({ priority, value })
    else this._data.splice(i, 0, { priority, value })

    return this
  }

  remove (value: T) {
    const i = this._data.findIndex(x => x.value === value)
    if (i === -1) return this

    this._data.splice(i, 1)
    return this
  }
}

/**
 * This element keeps focus inside itself. It’s intended to contain some kind of
 * modal interstitial.
 *
 * NOTE:
 * There must be some element inside this container which, when clicked,
 * unmounts this container!
 */
export class FocusContainer extends React.Component<{
  priority: number,
  children: React.Node,
}> {
  static activeFocusContainers = new SortedList()
  containerElement: ?HTMLDivElement

  constructor (props: *) {
    super(props)
    this.constructor.activeFocusContainers.insert(this, this.props.priority)
  }

  componentDidMount () {
    document.addEventListener(
      'focus',
      this.handleDocumentFocus,
      /* useCapture */ true
    )
    this._bringFocusInsideOverlay()
  }

  componentWillUnmount () {
    document.removeEventListener(
      'focus',
      this.handleDocumentFocus,
      /* useCapture */ true
    )
    this.constructor.activeFocusContainers.remove(this)
  }

  render () {
    return (
      <FocusableDiv tabIndex="0" innerRef={el => (this.containerElement = el)}>
        {this.props.children}
      </FocusableDiv>
    )
  }

  handleDocumentFocus = (e: FocusEvent) => {
    const target: HTMLDivElement = (e.target: any)
    if (
      this === this.constructor.activeFocusContainers.first &&
      this.containerElement != null &&
      !this.containerElement.contains(target)
    ) {
      // prevent default focus behavior (sometimes auto-scrolls the page)
      e.preventDefault()
      e.stopImmediatePropagation()
      this._bringFocusInsideOverlay()
    }
  }

  _bringFocusInsideOverlay = () => {
    // always delay focus manipulation to just before repaint to prevent scroll
    // jumping
    return requestAnimationFrame(() => {
      // container ref may be undefined between component mounting and Portal
      // rendering activeElement may be undefined in some rare cases in IE
      const containerElement = this.containerElement
      if (containerElement == null || document.activeElement == null) {
        return
      }

      const isFocusOutsideModal = !containerElement.contains(
        document.activeElement
      )
      if (isFocusOutsideModal) {
        // element marked autofocus has higher priority than the other clowns
        const autofocusElement = containerElement.querySelector('[autofocus]')
        if (autofocusElement != null) {
          autofocusElement.focus()
        } else {
          containerElement.focus()
        }
      }
    })
  }
}

const FocusableDiv = styled.div`
  &:focus {
    outline: none;
  }
`
