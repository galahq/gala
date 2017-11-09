/**
 * @providesModule MainMenu
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

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
import type { IntlShape } from 'react-intl'

class MainMenu extends React.Component<{ intl: IntlShape }, Reader> {
  state = window.reader

  render () {
    const { formatMessage } = this.props.intl
    const reader = this.state
    return reader ? (
      <Popover
        position={Position.BOTTOM_RIGHT}
        content={
          <Menu>
            <MenuItem
              text={formatMessage({
                id: 'menu.myAccount',
                defaultMessage: 'My account',
              })}
              iconName="user"
              href="/profile/edit"
            />
            <MenuItem
              text={formatMessage({
                id: 'menu.signOut',
                defaultMessage: 'Sign out',
              })}
              iconName="log-out"
              href="#"
              onClick={_ =>
                Orchard.prune('readers/sign_out').then(
                  () => (window.location = '/')
                )}
            />
          </Menu>
        }
      >
        <Row
          aria-label={formatMessage({
            id: 'menu.accountOptions',
            defaultMessage: 'Account options',
          })}
        >
          <Identicon reader={reader} />
          <CaretDown />
        </Row>
      </Popover>
    ) : (
      <AnchorButton
        className="pt-minimal"
        iconName="log-in"
        text={formatMessage({ id: 'menu.signIn', defaultMessage: 'Sign in' })}
        href="/readers/sign_in"
      />
    )
  }
}

export default injectIntl(MainMenu)

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
