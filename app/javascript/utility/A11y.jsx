/**
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

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
`
