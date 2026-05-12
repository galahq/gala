/**
 * @providesModule Toolbar
 * 
 */

import * as React from 'react'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { omit } from 'ramda'

import { Button, Popover, Menu, MenuItem, Position } from '@blueprintjs/core'

import { MaxWidthContainer } from 'utility/styledComponents'
import MaybeSpotlight from 'shared/spotlight/MaybeSpotlight'



const pass = (element) =>
  omit(['message', 'spotlightKey'], element)

const joinClasses = (...classNames) =>
  classNames.filter(Boolean).join(' ')

function withBlueprint4Classes(className) {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .reduce((classes, name) => {
      classes.push(name)
      if (name.startsWith('pt-')) classes.push(name.replace(/^pt-/, 'bp4-'))
      return classes
    }, [])
    .join(' ')
}

const Toolbar = ({ light, groups, intl, canBeIconsOnly }) => {
  if (!groups.some(group => group.some(element => element))) return null

  const t = (id) => (id ? intl.formatMessage({ id }) : null)

  return (
    <div className={joinClasses('Toolbar__bar', light ? 'Toolbar__bar--light' : 'pt-dark bp4-dark')}>
      <MaxWidthContainer className="MaxWidthContainer">
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
                const menuElement = (element)
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
                const buttonElement = (element)
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
