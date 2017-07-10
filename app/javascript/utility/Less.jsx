/**
 * @providesModule Less
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'

import { acceptKeyboardClick } from 'shared/keyboard'

// Less is a collapse component that shows a certain amount of its children
// before fading out and offering a “read more” link. The name is inspired by
// the unix tool.
class Less extends Component {
  static defaultProps = {
    height: '10em',
    prompt: 'Read more',
  }
  props: {
    children: React$Element<*>,
    height: string,
    prompt: string,
  }
  state = { open: false }

  _innerContainer: HTMLElement
  _getHeight = () =>
    this.state.open
      ? `${this._innerContainer.children[0].offsetHeight}px`
      : this.props.height

  handleToggle = () => {
    this.setState(({ open }: { open: boolean }) => ({ open: !open }))
  }

  render () {
    const { prompt, children } = this.props
    const { open } = this.state
    return (
      <OuterContainer>
        <InnerContainer
          open={open}
          height={this._getHeight()}
          innerRef={(ref: HTMLElement) => (this._innerContainer = ref)}
          onClick={this.handleToggle}
        >
          {children}
        </InnerContainer>
        {open ||
          <ReadMoreLink
            role="button"
            tabIndex="0"
            onClick={this.handleToggle}
            onKeyPress={acceptKeyboardClick(() => this.handleToggle())}
          >
            {prompt}
          </ReadMoreLink>}
      </OuterContainer>
    )
  }
}

export default Less

const OuterContainer = styled.div`
  position: relative;
  margin-bottom: 1em;
`

type InnerContainerProps = {
  height: string,
  open: boolean,
}
const InnerContainer = styled.div`
  overflow: hidden;
  height: ${({ height }: InnerContainerProps) => height};
  transition: height 0.2s ease-out;

  mix-blend-mode: ${({ open }: InnerContainerProps) =>
    open ? 'normal' : 'hard-light'};

  &:after {
    position: absolute;
    content: '';
    left: 0px;
    bottom: 0px;
    height: ${({ open }: InnerContainerProps) => (open ? '0' : '30%')};
    width: 100%;
    background: linear-gradient(transparent, gray);
    transition: background 0.2s ease-out;
  }
`

const ReadMoreLink = styled.a`
  font: 12pt tenso;
  color: black;
  position: absolute;
  bottom: -0.75em;
  left: 50%;
  transform: translateX(-50%);
`
