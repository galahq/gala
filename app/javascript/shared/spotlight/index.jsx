/**
 * A helpful tooltip shown to onboard new users.
 *
 * @providesModule Spotlight
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { Manager, Reference, Popper } from 'react-popper'
import { Portal } from '@blueprintjs/core'

import mergeRefs from 'utility/mergeRefs'
import useSpotlightManager from './useSpotlightManager'

import type { Placement } from 'react-popper'

const ROTATIONS = {
  top: -90,
  right: 0,
  bottom: 90,
  left: 180,
}

type Props = {
  children: ({ ref: any }) => React.Node,
  content: React.Node,
  placement: Placement,
  spotlightKey: string,
}

export default function Spotlight ({
  children,
  content,
  placement,
  spotlightKey,
}: Props) {
  const {
    onAcknowledge,
    ref: spotlightTargetRef,
    visible,
  } = useSpotlightManager({ spotlightKey })

  const persona = window.reader?.persona || 'reader'

  const popperOptions = {
    preventOverflow: { boundariesElement: 'window' },
    offset: { offset: '0, 16px' },
  }

  return (
    <Manager>
      <Reference>
        {({ ref: popperTargetRef }) => {
          const ref = mergeRefs(spotlightTargetRef, popperTargetRef)
          return children({ ref })
        }}
      </Reference>

      {visible && (
        <Portal>
          <Popper placement={placement} modifiers={popperOptions}>
            {({ ref, style, placement, arrowProps }) => (
              <Popover ref={ref} style={style}>
                <Arrow
                  persona={persona}
                  placement={placement}
                  {...arrowProps}
                />

                <Content persona={persona} popperPlacement={placement}>
                  <Text>
                    <Icon iconName="double-chevron-right" />
                    {content}
                  </Text>

                  <Actions>
                    <Button persona={persona} onClick={onAcknowledge}>
                      Got it!
                    </Button>
                  </Actions>
                </Content>
              </Popover>
            )}
          </Popper>
        </Portal>
      )}
    </Manager>
  )
}

Spotlight.defaultProps = { placement: 'auto' }

const INTENTS = {
  learner: 'primary',
  teacher: 'warning',
  writer: 'success',
}

const Popover = styled.div.attrs({
  className: 'pt-popover pt-popover-content-sizing',
})`
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2),
    0 18px 46px 6px rgba(16, 22, 26, 0.2) !important;
`

const Content = styled.div.attrs(p => ({
  className: `pt-popover-content personas__choice personas__choice--learner persona--${
    p.persona
  }`,
}))`
  ${p =>
    p.popperPlacement === 'bottom' &&
    css`
      border-width: 0 0 6px;
    `}
`

function Arrow ({ style, persona, placement }, ref) {
  return (
    <span
      className="pt-popover-arrow"
      ref={ref}
      style={{
        ...style,
        [placement]: 'calc(100% - 19px)',
      }}
    >
      <svg
        viewBox="0 0 30 30"
        style={{ transform: `rotate(${ROTATIONS[placement]}deg)` }}
      >
        <path
          className="pt-popover-arrow-border"
          d="M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z"
        />
        <path
          className={`persona--${persona}`}
          d="M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z"
        />
      </svg>
    </span>
  )
}

// $FlowFixMe
Arrow = React.forwardRef(Arrow) // eslint-disable-line no-func-assign

const Text = styled.p`
  font-family: ${p => p.theme.sansFont};
  font-size: 16px;
  margin: 0 0 4px 24px !important;
`

const Icon = styled.span.attrs(p => ({
  className: `pt-icon pt-icon-${p.iconName}`,
}))`
  margin-left: -24px;
  margin-right: 8px;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: -4px;
`

const Button = styled.button.attrs(p => ({
  className: `pt-button pt-minimal pt-icon-tick pt-intent-${
    INTENTS[p.persona]
  }`,
  'data-testid': 'spotlight-acknowledge',
}))``
