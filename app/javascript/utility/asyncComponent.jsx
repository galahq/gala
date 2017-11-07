/**
 * @providesModule asyncComponent
 * @flow
 */

import * as React from 'react'

function asyncComponent<P: {}> (
  getComponent: () => Promise<React.ComponentType<P>>
): React.ComponentType<P> {
  return class AsyncComponent extends React.Component<
    P,
    { Component: ?React.ComponentType<P> }
  > {
    static Component: ?React.ComponentType<P> = null
    state = { Component: AsyncComponent.Component }

    componentWillMount () {
      if (!this.state.Component) {
        getComponent().then(Component => {
          AsyncComponent.Component = Component
          this.setState({ Component })
        })
      }
    }

    render () {
      const { Component } = this.state
      if (Component) return <Component {...this.props} />
      return null
    }
  }
}

export default asyncComponent
