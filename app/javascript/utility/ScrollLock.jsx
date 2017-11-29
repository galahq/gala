/**
 * @providesModule ScrollLock
 * @flow
 */

import * as React from 'react'

class ScrollLock extends React.Component<{ children: React.Node }> {
  componentDidMount () {
    document.body && document.body.classList.add('pt-overlay-open')
  }

  componentWillUnmount () {
    document.body && document.body.classList.remove('pt-overlay-open')
  }

  render () {
    return this.props.children
  }
}
export default ScrollLock
