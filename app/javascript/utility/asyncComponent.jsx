/**
 * @providesModule asyncComponent
 * 
 */

import * as React from 'react'

function asyncComponent (
  getComponent
) {
  return class AsyncComponent extends React.Component {
    static Component = null
    state = { Component: AsyncComponent.Component }

    componentDidMount () {
      if (!this.state.Component) {
        getComponent()
          .then(Component => {
            AsyncComponent.Component = Component
            this.setState({ Component })
          })
          .catch(error => {
            // A failed dynamic import() (e.g. a stale chunk after a deploy) would
            // otherwise be an unhandled rejection that React 19 surfaces as an overlay.
            // Log it; the lazy section renders nothing until a reload fetches the chunk.
            console.error('Failed to load async component:', error)
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
