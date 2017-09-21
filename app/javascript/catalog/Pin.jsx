/**
 * @providesModule Pin
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'

import { Element } from 'catalog/shared'
import { AnchorButton, Tooltip } from '@blueprintjs/core'

class Pin extends Component {
  props: {
    isOpen: boolean,
    onClick: string => void,
  }

  handleClick = () =>
    this.props.onClick(this.props.isOpen ? '' : 'dioxane-plume')

  render () {
    return (
      <div>
        <Tooltip
          isOpen={this.props.isOpen}
          content={
            <TooltipElement
              image="https://msc-gala.imgix.net/gelman-plume-map.png?fit=crop&crop=faces,entropy&w=200&h=200"
              text="Dioxane Plume Pollution"
              rightElement={
                <AnchorButton
                  iconName="circle-arrow-right"
                  className="pt-minimal"
                  href="/cases/dioxane-plume"
                />
              }
            />
          }
        >
          <PinIcon onClick={this.handleClick} />
        </Tooltip>
      </div>
    )
  }
}
export default Pin

const TooltipElement = styled(Element).attrs({
  className: 'pt-dark',
})`margin-bottom: -4px;`
const PinIcon = styled.span.attrs({
  dangerouslySetInnerHTML: { __html: require('images/pin.svg') },
})`
  cursor: pointer;
`
