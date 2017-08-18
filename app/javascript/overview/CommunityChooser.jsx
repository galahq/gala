/**
 * @providesModule CommunityChooser
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { Popover, Menu, MenuItem, Position } from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'

import type { State, Community } from 'redux/state'

type OwnProps = { rounded: boolean }
function mapStateToProps ({ communities }: State, { rounded }: OwnProps) {
  return {
    rounded,
    communities,
    activeCommunity: communities.find(community => community.active),
  }
}

type Props = {
  activeCommunity: ?Community,
  communities: Community[],
  rounded: boolean,
}
export const UnconnectedCommunityChooser = ({
  activeCommunity,
  communities,
  rounded,
}: Props) =>
  <Bar empty={!activeCommunity} rounded={rounded}>
    {activeCommunity &&
      <Popover
        position={rounded ? Position.BOTTOM_LEFT : Position.BOTTOM}
        content={
          <CommunityMenu>
            <li className="pt-menu-header">
              <h6>Choose a community</h6>
            </li>
            <Instructions>
              You’ll see the discussion taking place in the community you
              choose.
            </Instructions>
            {communities.map(c =>
              <MenuItem
                key={c.id || 'null'}
                iconName={c.global ? 'globe' : 'social-media'}
                className={c.active ? 'pt-active pt-intent-primary' : ''}
                text={c.name}
                onClick={() => {}}
                onKeyPress={acceptKeyboardClick}
              />
            )}
          </CommunityMenu>
        }
      >
        <CommunityName onClick={acceptKeyboardClick}>
          <span>{activeCommunity.name}</span> ▾
        </CommunityName>
      </Popover>}
  </Bar>

export default connect(mapStateToProps)(UnconnectedCommunityChooser)

const Bar = styled.div`
  background-color: #373566;
  font-size: 10pt;
  line-height: 1.2;
  text-align: center;
  width: 100%;
  padding: ${({ empty }) => (empty ? '0' : '5px')};
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${({ empty }) => (empty ? '#6acb72' : '#8764ea')};
  border-radius: ${({ rounded }) => (rounded ? '0 0 2pt 2pt' : '0')};
`

const CommunityMenu = styled(Menu)`
  width: 16em;
`

const Instructions = styled.li`
  margin: 5px;
  padding-left: 2px;
  font-style: italic;
  line-height: 1.2;
`

const CommunityName = styled.a.attrs({
  tabIndex: '0',
  href: '#',
})`
  font-weight: bold;
  color: #d4c5ff !important;
  display: inline-block;

  &:focus,
  &:hover {
    outline: none;
    color: white !important;

    & > span {
      text-decoration: underline;
    }
  }
`
