/**
 * @providesModule Toolbar
 * @flow
 */

import * as React from 'react'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
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
type BarMessage = {| message: string, spotlightKey?: string |}
type BarMenu = {|
  message?: string,
  icon: string,
  spotlightKey?: string,
  submenu: Array<BarButton>,
|}
type BarComponent = {|
  message?: string,
  component: React.Element<*>,
  spotlightKey?: string,
|}
type BarElement = BarButton | BarMessage | BarMenu | BarComponent
type BarGroup = Array<?BarElement>

const pass = (element: BarButton | BarMenu) =>
  omit(['message', 'spotlightKey'], element)

const joinClasses = (...classNames: Array<?string>): string =>
  classNames.filter(Boolean).join(' ')

function withBlueprint4Classes(className: string): string {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .reduce((classes: string[], name: string) => {
      classes.push(name)
      if (name.startsWith('pt-')) classes.push(name.replace(/^pt-/, 'bp4-'))
      return classes
    }, [])
    .join(' ')
}

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
    <div className={joinClasses('Toolbar__bar', light ? 'Toolbar__bar--light' : 'pt-dark bp4-dark')}>
      <MaxWidthContainer>
        {groups.map((group, i) => (
          <div
            key={i}
            className={joinClasses(
              'Toolbar__group',
              'pt-navbar-group',
              'bp4-navbar-group',
              canBeIconsOnly ? 'Toolbar__group--icons-only' : null
            )}
          >
            {group.map((element, j) => {
              if (element == null) return null

              const spotlightKey = element.spotlightKey
                ? element.spotlightKey
                : undefined

              if (element.component != null) {
                /**
                 * BarComponent -- an arbitrary custom component
                 */
                return React.cloneElement(element.component, { key: j })
              }

              if (element.submenu != null) {
                /**
                 * BarMenu -- a button with a dropdown menu of other buttons
                 */
                const menuElement: BarMenu = (element: any)
                return (
                  <Popover
                    key={j}
                    position={Position.BOTTOM_RIGHT}
                    content={
                      <StyledMenu>
                        {menuElement.submenu.map(
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
                      key={spotlightKey || j}
                      spotlightKey={spotlightKey}
                      placement="bottom"
                    >
                      {({ ref }) => (
                        <Item
                          elementRef={ref}
                          text={t(menuElement.message)}
                          {...pass(menuElement)}
                        />
                      )}
                    </MaybeSpotlight>
                  </Popover>
                )
              }

              if (element.onClick != null) {
                /**
                 * BarButton -- a clickable button
                 */
                const buttonElement: BarButton = (element: any)
                return (
                  <MaybeSpotlight
                    key={spotlightKey || j}
                    spotlightKey={spotlightKey}
                    placement="bottom"
                  >
                    {({ ref }) => (
                      <Item
                        elementRef={ref}
                        text={t(buttonElement.message)}
                        {...pass(buttonElement)}
                      />
                    )}
                  </MaybeSpotlight>
                )
              }

              /**
               * BarMessage -- just translated text
               */
              return <span key={j}>{t(element.message)}</span>
            })}
          </div>
        ))}
      </MaxWidthContainer>
    </div>
  )
}

export default injectIntl(Toolbar)
const Item = styled(Button).attrs(props => {
  const className = joinClasses('Toolbar__item', props.className || 'pt-minimal')

  return {
    className: withBlueprint4Classes(className),
  }
})`
`

const StyledMenu = styled(Menu).attrs(() => ({
  className: 'Toolbar__menu',
}))`
`
