/**
 * @providesModule Pin
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { Element } from 'catalog/shared'
import { AnchorButton, Tooltip } from '@blueprintjs/core'

import type { Case } from 'redux/state'

class Pin extends React.Component<{
  className?: string,
  isOpen?: boolean,
  kase?: Case,
  onClick?: string => void,
}> {
  handleClick = () => {
    const { onClick, kase, isOpen } = this.props
    if (onClick && kase) onClick(isOpen ? '' : kase.slug)
  }

  render () {
    const { kase, isOpen, className } = this.props
    return (
      <div className={className}>
        <Tooltip
          isOpen={isOpen || false}
          content={
            kase ? (
              <TooltipElement
                image={kase.smallCoverUrl}
                text={kase.kicker}
                rightElement={
                  !!kase.publishedAt && (
                    <AnchorButton
                      icon="circle-arrow-right"
                      className="bp3-intent-success"
                      href={kase.links.self}
                    />
                  )
                }
              />
            ) : (
              ''
            )
          }
        >
          <PinIcon interactive={!!kase} onClick={this.handleClick} />
        </Tooltip>
      </div>
    )
  }
}
export default Pin

const TooltipElement = styled(Element)`
  margin-bottom: -4px;
`
const PinIcon = styled.span.attrs({
  dangerouslySetInnerHTML: { __html: require('images/pin.svg') },
})`
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'normal')};
`
