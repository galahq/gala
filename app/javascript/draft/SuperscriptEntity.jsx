import * as React from 'react'
import styled from 'styled-components'

const StyledSuperscript = styled.sup`
  font-size: 0.7em;
  position: relative;
  bottom: 0.7em;
  display: inline-block;
  line-height: 0;
  vertical-align: baseline;
`

const SuperscriptEntity = (props) => {
  return <StyledSuperscript>{props.children}</StyledSuperscript>
}

export default SuperscriptEntity 