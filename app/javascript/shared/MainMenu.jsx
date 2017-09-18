/**
 * @providesModule MainMenu
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import {
  AnchorButton,
  Popover,
  Position,
  Menu,
  MenuItem,
} from '@blueprintjs/core'

import Identicon from 'shared/Identicon'
import { Orchard } from 'shared/orchard'
import { acceptKeyboardClick } from 'shared/keyboard'

import type { Reader } from 'redux/state'

class MainMenu extends React.Component {
  state: Reader = window.reader

  render () {
    const reader = this.state
    return reader ? (
      <Popover
        position={Position.BOTTOM_RIGHT}
        content={
          <Menu>
            <MenuItem text="My account" iconName="user" href="/profile/edit" />
            <MenuItem
              text="Sign out"
              iconName="log-out"
              href="#"
              onClick={() =>
                Orchard.prune('readers/sign_out').then(
                  () => (window.location = '/')
                )}
            />
          </Menu>
        }
      >
        <Row aria-label="Account options">
          <Identicon reader={reader} />
          <CaretDown />
        </Row>
      </Popover>
    ) : (
      <AnchorButton
        className="pt-minimal"
        iconName="log-in"
        text="Sign in"
        href="/readers/sign_in"
      />
    )
  }
}

export default MainMenu

const CaretDown = styled.span.attrs({
  className: 'pt-icon pt-icon-caret-down',
})`
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.5);
`
const Row = styled.div.attrs({
  role: 'button',
  tabIndex: '0',
  onKeyPress: () => acceptKeyboardClick,
})`
  display: flex;
  align-items: center;
  cursor: pointer;
`
