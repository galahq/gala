/**
 * @providesModule CommunityChooser
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  Popover,
  Menu,
  MenuItem,
  Position,
  Tooltip,
  Intent,
} from '@blueprintjs/core'

import { acceptKeyboardClick } from 'shared/keyboard'
import { updateActiveCommunity } from 'redux/actions'

import type { State, Community } from 'redux/state'

type OwnProps = { rounded: boolean, white: boolean, disabled: boolean }
function mapStateToProps (
  { caseData, communities }: State,
  { rounded, white, disabled }: OwnProps
) {
  const { reader, slug: caseSlug } = caseData
  return {
    rounded,
    white,
    communities,
    caseSlug,
    disabled,
    activeCommunity: reader && reader.enrollment && reader.activeCommunity,
  }
}

type Props = {
  activeCommunity: ?Community,
  communities: ?(Community[]),
  rounded: boolean,
  white: boolean,
  disabled: boolean,
  caseSlug?: string,
  updateActiveCommunity?: typeof updateActiveCommunity,
}
export const UnconnectedCommunityChooser = ({
  activeCommunity,
  communities,
  rounded,
  white,
  disabled,
  caseSlug,
  updateActiveCommunity,
}: Props) => {
  const activeCommunityPresent = (communities || [])
    .some(x => activeCommunity && x.id === activeCommunity.id)
  const anyCommunitiesPresent = communities && communities.length > 0
  return (
    <Bar
      empty={!activeCommunity}
      rounded={rounded}
      white={white}
      disabled={disabled}
    >
      {activeCommunity &&
        <Popover
          position={rounded ? Position.BOTTOM_LEFT : Position.BOTTOM}
          isDisabled={!anyCommunitiesPresent}
          content={
            <CommunityMenu>
              <li className="pt-menu-header">
                <h6>Choose a community</h6>
              </li>
              <Instructions>
                You’ll see the discussion taking place in the community you
                choose.
              </Instructions>
              {(communities || []).map(c =>
                <MenuItem
                  key={c.id || 'null'}
                  iconName={c.global ? 'globe' : 'social-media'}
                  className={c.active ? 'pt-active pt-intent-primary' : ''}
                  text={c.name}
                  onClick={() => {
                    updateActiveCommunity &&
                      caseSlug &&
                      updateActiveCommunity(caseSlug, c.id)
                  }}
                  onKeyPress={acceptKeyboardClick}
                />
              )}
            </CommunityMenu>
          }
        >
          <CommunityName white={white} onClick={acceptKeyboardClick}>
            <Tooltip
              isDisabled={activeCommunityPresent}
              content="Your active community is not discussing this case"
              intent={Intent.DANGER}
              position={rounded ? Position.TOP_LEFT : Position.TOP}
            >
              <span>
                <span
                  className={`pt-icon pt-icon-${activeCommunityPresent
                    ? activeCommunity.global ? 'globe' : 'social-media'
                    : 'cross'}`}
                />&#8196;
                {activeCommunity.name}
              </span>
            </Tooltip>
            {disabled || !anyCommunitiesPresent ? '' : ' ▾'}
          </CommunityName>
        </Popover>}
    </Bar>
  )
}

export default connect(mapStateToProps, { updateActiveCommunity })(
  UnconnectedCommunityChooser
)

const Bar = styled.div`
  background-color: ${({ white }) => (white ? '#EBEAE4' : '#373566')};
  font-size: 10pt;
  line-height: 1.2;
  text-align: center;
  width: 100%;
  padding: ${({ empty }) => (empty ? '0' : '5px')};
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${({ empty }) => (empty ? '#6acb72' : '#8764ea')};
  border-radius: ${({ rounded, white }) =>
    white ? '2pt' : rounded ? '0 0 2pt 2pt' : '0'};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'all')};
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
  display: inline-block;

  color: ${({ white }) => (white ? '#373566' : '#d4c5ff')} !important;

  &:focus,
  &:hover {
    outline: none;
    color: white !important;

    & > span {
      text-decoration: underline;
    }
  }
`
