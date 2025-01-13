/**
 * @providesModule Toolbar
 * @flow
 */

import * as React from 'react'
import { injectIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { omit } from 'ramda'

import { Button, Popover, Menu, MenuItem, Position } from '@blueprintjs/core'

import { MaxWidthContainer } from 'utility/styledComponents'
import MaybeSpotlight from 'shared/spotlight/MaybeSpotlight'

import type { IntlShape } from 'react-intl'

type BarButton = {|
  className?: string,
  disabled?: boolean,
  icon: string,
  message?: string,
  onClick: () => any,
  spotlightKey?: string,
|}
type BarMessage = {| message: string |}
type BarMenu = {|
  message?: string,
  icon: string,
  spotlightKey?: string,
  submenu: Array<BarButton>,
|}
type BarComponent = {|
  message?: string,
  component: React.Element<*>,
|}
type BarElement = BarButton | BarMessage | BarMenu | BarComponent
type BarGroup = Array<?BarElement>

const pass = omit(['message'])

type Props = {
  light?: boolean,
  groups: [BarGroup, BarGroup, BarGroup],
  intl: IntlShape,
  canBeIconsOnly: boolean,
}
const Toolbar = ({ light, groups, intl, canBeIconsOnly }: Props) => {
  if (!groups.some(group => group.some(element => element))) return null

  const t = (id: ?string) => (id ? intl.formatMessage({ id }) : null)

  return (
    <Bar light={light}>
      <MaxWidthFlexContainer>
        {groups.map((group, i) => (
          <Group key={i} canBeIconsOnly={canBeIconsOnly}>
            {group.map((element, j) => {
              if (element == null) return null

              const spotlightKey = element.spotlightKey
                ? element.spotlightKey
                : undefined

              return element.component != null ? (
                /**
                 * BarComponent -- an arbitrary custom component
                 */
                React.cloneElement(element.component, { key: j })
              ) : element.submenu != null ? (
                /**
                 * BarMenu -- a button with a dropdown menu of other buttons
                 */
                <Popover
                  key={j}
                  position={Position.BOTTOM_RIGHT}
                  content={
                    <StyledMenu>
                      {element.submenu &&
                        element.submenu.map(
                          (item, k) =>
                            item && (
                              <MenuItem
                                key={k}
                                href="#"
                                text={t(item.message) || ''}
                                {...pass(item)}
                              />
                            )
                        )}
                    </StyledMenu>
                  }
                >
                  <MaybeSpotlight
                    key={spotlightKey}
                    spotlightKey={spotlightKey}
                    placement="bottom"
                  >
                    {({ ref }) => (
                      <Item
                        key={j}
                        elementRef={ref}
                        text={t(element.message)}
                        {...pass(element)}
                      />
                    )}
                  </MaybeSpotlight>
                </Popover>
              ) : element.onClick != null ? (
                /**
                 * BarButton -- a clickable button
                 */
                <MaybeSpotlight spotlightKey={spotlightKey} placement="bottom">
                  {({ ref }) => (
                    <Item
                      key={j}
                      elementRef={ref}
                      text={t(element.message)}
                      {...pass(element)}
                    />
                  )}
                </MaybeSpotlight>
              ) : (
                /**
                 * BarMessage -- just translated text
                 */
                <span key={j}>{t(element.message)}</span>
              )
            })}
          </Group>
        ))}
      </MaxWidthFlexContainer>
    </Bar>
  )
}

export default injectIntl(Toolbar)

const Bar = styled.div.attrs({ className: ({ light }) => light || 'pt-dark' })`
  width: 100%;
  overflow: auto;

  color: ${({ light }) => (light ? '#262626' : '#ebeae4')};
  background-color: ${({ light }) => (light ? '#ebeae4' : '#1d3f5e')};
  border-color: ${({ light }) => (light ? '#ebeae4' : '#1d3f5e')};
  border-width: 2px;
  border-style: solid;
  border-bottom-color: ${({ light }) => (light ? '#c0bca9' : '#193c5b')};

  font: 90% ${p => p.theme.sansFont};
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: initial;
  letter-spacing: 0em;
`
const MaxWidthFlexContainer = styled(MaxWidthContainer)`
  display: flex;
  justify-content: space-between;

  & > div:nth-child(2) {
    flex: 0;
  }

  & > div:nth-child(3) {
    justify-content: flex-end;
  }
`
const Group = styled.div.attrs({ className: 'pt-navbar-group' })`
  height: 36px !important;
  margin: 0 8px;
  flex: 1;
  white-space: nowrap;

  ${({ canBeIconsOnly }) =>
    canBeIconsOnly
      ? css`
          @media screen and (max-width: 513px) {
            & .pt-button {
              &:before {
                margin-right: 0;
              }
              span {
                display: none;
              }
            }
          }
        `
      : ''};
`
const Item = styled(Button).attrs({
  className: p => p.className || 'pt-minimal',
})``

const StyledMenu = styled(Menu)`
  font-size: 90%;
`
