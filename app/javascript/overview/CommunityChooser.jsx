/**
 * @providesModule CommunityChooser
 * @flow
 */

import * as React from 'react'
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
import { FormattedMessage, injectIntl } from 'react-intl'

import { acceptKeyboardClick } from 'shared/keyboard'
import { updateActiveCommunity } from 'redux/actions'

import MaybeSpotlight from 'shared/spotlight/MaybeSpotlight'
import { Container as MagicLinkContainer } from 'magic_link/shared'

import type { IntlShape } from 'react-intl'
import type { State, Community } from 'redux/state'

type OwnProps = {| rounded?: boolean, disabled?: boolean |}

type StateProps = {|
  activeCommunity: ?Community,
  communities: Community[],
  caseSlug: string,
|}

function mapStateToProps ({ caseData, forums }: State) {
  const { reader, slug: caseSlug } = caseData
  return {
    communities: forums.map(forum => forum.community),
    caseSlug,
    activeCommunity: reader?.enrollment && reader?.activeCommunity,
  }
}

type Props = {|
  ...StateProps,
  ...OwnProps,
  updateActiveCommunity?: typeof updateActiveCommunity,
  intl: IntlShape,
|}

export const UnconnectedCommunityChooser = injectIntl(
  ({
    activeCommunity,
    communities,
    rounded,
    disabled,
    caseSlug,
    updateActiveCommunity,
    intl,
  }: Props) => {
    if (!activeCommunity) return null

    const activeCommunityPresent = (communities || []).some(
      community => activeCommunity && community.param === activeCommunity.param
    )

    const anyCommunitiesPresent = communities && communities.length > 0

    return (
      <MaybeSpotlight
        placement="left"
        spotlightKey={communities.length > 1 ? 'community_chooser' : undefined}
      >
        {({ ref }) => (
          <Bar ref={ref} rounded={rounded} disabled={disabled}>
            {activeCommunity && (
              <Popover
                position={rounded ? Position.BOTTOM_LEFT : Position.BOTTOM}
                disabled={!anyCommunitiesPresent}
                content={
                  <CommunityMenu>
                    <li className="bp3-menu-header">
                      <h6>
                        <FormattedMessage id="communities.index.chooseACommunity" />
                      </h6>
                    </li>

                    <Instructions>
                      <FormattedMessage id="communities.index.instructions" />
                    </Instructions>

                    {(communities || []).map(c => (
                      <MenuItem
                        key={c.param || 'null'}
                        icon={communityIcon(c)}
                        className={
                          c.active ? 'bp3-active bp3-intent-primary' : ''
                        }
                        text={c.name}
                        onClick={() => {
                          updateActiveCommunity &&
                            caseSlug &&
                            updateActiveCommunity(caseSlug, c.param)
                        }}
                        onKeyPress={acceptKeyboardClick}
                      />
                    ))}
                  </CommunityMenu>
                }
              >
                <CommunityName
                  disabled={!anyCommunitiesPresent}
                  onClick={acceptKeyboardClick}
                >
                  <Tooltip
                    disabled={activeCommunityPresent}
                    content={intl.formatMessage({
                      id: 'communities.index.notDiscussing',
                    })}
                    intent={Intent.DANGER}
                    position={rounded ? Position.TOP_LEFT : Position.TOP}
                  >
                    <>
                      <span
                        className={`bp3-icon bp3-icon-${communityIcon(
                          activeCommunity,
                          {
                            disabled: !activeCommunityPresent,
                          }
                        )}`}
                      />
                      &#8196;
                      <span>{activeCommunity.name}</span>
                    </>
                  </Tooltip>

                  {disabled || !anyCommunitiesPresent ? '' : ' ▾'}
                </CommunityName>
              </Popover>
            )}
          </Bar>
        )}
      </MaybeSpotlight>
    )
  }
)

// $FlowFixMe
export default connect(
  mapStateToProps,
  { updateActiveCommunity }
)(UnconnectedCommunityChooser)

function communityIcon (
  { global, name }: Community,
  { disabled }: { disabled?: boolean } = {}
) {
  if (disabled) return 'cross'
  if (name === 'CaseLog') return 'key'
  return global ? 'globe' : 'social-media'
}

const Bar = styled.div`
  background-color: hsla(255, 100%, 95%);
  border-bottom: 4px solid #8764ea;
  border-radius: ${({ rounded }) => (rounded ? '3px' : '0')};
  font-size: 10pt;
  line-height: 1.2;
  padding: 5px;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'all')};
  text-align: center;

  ${MagicLinkContainer} & {
    margin-top: 1em;
    width: 100%;
  }
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

  color: hsl(255, 43%, 43%) !important;

  &:focus,
  &:hover {
    outline: none;
    color: inhert;

    & .bp3-icon + span {
      text-decoration: ${({ disabled }) => (disabled ? '' : 'underline')};
    }
  }
`
