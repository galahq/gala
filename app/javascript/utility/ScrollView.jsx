/**
 * @providesModule ScrollView
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

class ScrollView extends React.Component<{
  maxHeightOffset: string,
  innerRef: (?HTMLDivElement) => any,
  children: React.Node,
}> {
  static defaultProps = { innerRef: (_: HTMLDivElement) => {} }

  container: ?HTMLDivElement

  componentDidMount () {
    this.container &&
      this.container.addEventListener('wheel', this.handleScroll, false)
    this.container && this.props.innerRef(this.container)
  }

  componentWillUnmount () {
    this.container &&
      this.container.removeEventListener('wheel', this.handleScroll, false)
  }

  render () {
    const { children, ...rest } = this.props
    return (
      <ScrollViewDiv {...rest} ref={el => (this.container = el)}>
        {children}
      </ScrollViewDiv>
    )
  }

  handleScroll = (e: WheelEvent) => {
    const target = ((e.target: any): HTMLElement)
    if (this.container && this.container.contains(target)) {
      var scrollTop = this.container.scrollTop
      var scrollHeight = this.container.scrollHeight
      var height = this.container.clientHeight
      var wheelDelta = e.deltaY
      var isDeltaPositive = wheelDelta > 0

      if (isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop) {
        this.container.scrollTop = scrollHeight
        return cancelScrollEvent(e)
      } else if (!isDeltaPositive && -wheelDelta > scrollTop) {
        this.container.scrollTop = 0
        return cancelScrollEvent(e)
      }
    }
  }
}
export default ScrollView

function cancelScrollEvent (e: WheelEvent) {
  e.stopImmediatePropagation()
  e.preventDefault()
  return false
}

// $FlowFixMe
const ScrollViewDiv = styled.div.attrs({ className: 'ScrollView' })`
  max-height: ${({ maxHeightOffset }) =>
    `calc(100vh - (${maxHeightOffset}))` || '100vh'};
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`

export class ScrollIntoView extends React.Component<{}> {
  ref: ?HTMLDivElement

  componentDidMount () {
    setTimeout(() => {
      const rect = this.ref && this.ref.getBoundingClientRect()
      const windowHeight = document.documentElement?.clientHeight

      if (
        rect &&
        windowHeight &&
        (rect.top < 0 || rect.bottom > windowHeight)
      ) {
        this.ref &&
          this.ref.scrollIntoView &&
          this.ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  render () {
    return <ScrollTarget ref={ref => (this.ref = ref)} />
  }
}
const ScrollTarget = styled.div`
  transform: translateY(-50px);
`

export class ScrollLock extends React.Component<{ children: React.Node }> {
  componentDidMount () {
    document.body && document.body.classList.add('bp3-overlay-open')
  }

  componentWillUnmount () {
    document.body && document.body.classList.remove('bp3-overlay-open')
  }

  render () {
    return this.props.children
  }
}
