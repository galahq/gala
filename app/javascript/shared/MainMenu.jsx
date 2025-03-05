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
      <Row>
        <HelpButton />
        <Popover
          position={Position.BOTTOM_RIGHT}
          content={
            <Menu>
              <MenuItem
                text={formatMessage({ id: 'readers.form.myAccount' })}
                icon="user"
                href="/profile/edit"
              />
              <MenuItem
                text={formatMessage({ id: 'devise.sessions.destroy.signOut' })}
                icon="log-out"
                href="#"
                onClick={_ =>
                  Orchard.prune('readers/sign_out').then(
                    () => (window.location = '/')
                  )
                }
              />
            </Menu>
          }
        >
          <ButtonRow
            aria-label={formatMessage({ id: 'readers.form.accountOptions' })}
          >
            <Identicon reader={reader} />
            <CaretDown />
          </ButtonRow>
        </Popover>
      </Row>
    ) : (
      <AnchorButton
        className="bp3-minimal"
        icon="log-in"
        text={formatMessage({ id: 'devise.sessions.new.signIn' })}
        href="/readers/sign_in"
      />
    )
  }
}

export default injectIntl(MainMenu)

const HelpButton = injectIntl(styled.a.attrs({
  className: 'bp3-button bp3-minimal bp3-icon-help',
  href: 'https://docs.learngala.com',
  target: '_blank',
  rel: 'noopener noreferrer',
  'aria-label': p => p.intl.formatMessage({ id: 'helpers.help' }),
})`
  margin-right: 1.5em;
  opacity: 0.5;
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 1;
  }
`)

const CaretDown = styled.span.attrs({
  className: 'bp3-icon bp3-icon-caret-down',
})`
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.5);
`
const Row = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`
const ButtonRow = styled(Row).attrs({
  role: 'button',
  tabindex: '0',
  onKeyPress: () => acceptKeyboardClick,
})``
