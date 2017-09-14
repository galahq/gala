/**
 * @providesModule Toolbar
 * @flow
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { omit } from 'ramda'

import { Button, Popover, Menu, MenuItem, Position } from '@blueprintjs/core'

import { MaxWidthContainer } from 'utility/styledComponents'

type BarButton = {|
  disabled?: boolean,
  message?: string,
  onClick: () => any,
  iconName: string,
|}
type BarMessage = {| message: string |}
type BarMenu = {|
  message?: string,
  iconName: string,
  submenu: Array<BarButton>,
|}
type BarElement = BarButton | BarMessage | BarMenu
type BarGroup = Array<?BarElement>

const pass = omit(['message', 'submenu'])

type Props = {
  light?: boolean,
  groups: [BarGroup, BarGroup, BarGroup],
  intl: any,
}
const Toolbar = ({ light, groups, intl }: Props) => {
  if (!groups.some(group => group.some(element => element))) return null

  const t = (id: ?string) => (id ? intl.formatMessage({ id }) : null)

  return (
    <Bar light={light}>
      <MaxWidthFlexContainer>
        {groups.map((group, i) => (
          <Group key={i}>
            {group.map((element, j) => {
              if (element == null) return null

              return element.submenu != null ? (
                <Popover
                  key={j}
                  position={Position.BOTTOM_RIGHT}
                  content={
                    <StyledMenu>
                      {element.submenu &&
                        element.submenu.map((item, k) => (
                          <MenuItem
                            key={k}
                            href="#"
                            text={t(item.message) || ''}
                            {...pass(item)}
                          />
                        ))}
                    </StyledMenu>
                  }
                >
                  <Item key={j} text={t(element.message)} {...pass(element)} />
                </Popover>
              ) : element.onClick ? (
                <Item key={j} text={t(element.message)} {...pass(element)} />
              ) : (
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

  color: ${({ light }) => (light ? '#262626' : '#ebeae4')};
  background-color: ${({ light }) => (light ? '#ebeae4' : '#1d3f5e')};
  border-color: ${({ light }) => (light ? '#ebeae4' : '#1d3f5e')};
  border-width: 2px;
  border-style: solid;
  border-bottom-color: ${({ light }) => (light ? '#c0bca9' : '#193c5b')};

  font: 90% 'tenso';
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: initial;
  letter-spacing: 0em;
`
const MaxWidthFlexContainer = MaxWidthContainer.extend`
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
  height: 36px;
  margin: 0 8px;
  flex: 1;
  white-space: nowrap;

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
const Item = styled(Button).attrs({ className: 'pt-minimal' })``

const StyledMenu = styled(Menu)`font-size: 90%;`
