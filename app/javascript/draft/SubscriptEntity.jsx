import * as React from 'react'
import styled from 'styled-components'

const StyledSubscript = styled.sub`
  font-size: 0.7em;
  position: relative;
  bottom: -0.3em;
  display: inline-block;
  line-height: 0;
  vertical-align: baseline;
`

const SubscriptEntity = (props) => {
  return <StyledSubscript>{props.children}</StyledSubscript>
}

export default SubscriptEntity 