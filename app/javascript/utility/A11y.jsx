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
 * This element keeps focus inside itself. It’s intended to contain some kind of
 * modal interstitial.
 *
 * NOTE:
 * There must be some element inside this container which, when clicked,
 * unmounts this container!
 *
 * Extracted from @blueprintjs/core overlay; converted from typescript
 * https://github.com/palantir/blueprint/blob/master/packages/core/src/components/overlay/overlay.tsx
 */
export class FocusContainer extends React.Component<{ children: React.Node }> {
  containerElement: ?HTMLDivElement

  componentDidMount () {
    document.addEventListener(
      'focus',
      this.handleDocumentFocus,
      /* useCapture */ true
    )
  }

  componentWillUnmount () {
    document.removeEventListener(
      'focus',
      this.handleDocumentFocus,
      /* useCapture */ true
    )
  }

  render () {
    return (
      <div tabIndex="0" ref={el => (this.containerElement = el)}>
        {this.props.children}
      </div>
    )
  }

  handleDocumentFocus = (e: FocusEvent) => {
    const target: HTMLDivElement = (e.target: any)
    if (
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
        const wrapperElement = containerElement.querySelector('[tabindex]')
        if (autofocusElement != null) {
          autofocusElement.focus()
        } else if (wrapperElement != null) {
          wrapperElement.focus()
        } else {
          containerElement.focus()
        }
      }
    })
  }
}
