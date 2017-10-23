/**
 * @providesModule LibraryLogo
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import type { Library } from 'redux/state'

const LibraryLogo = ({ library }: { library: Library }) => (
  <Container title={library.name} {...library}>
    <Logo src={library.logoUrl} />
  </Container>
)
export default LibraryLogo

const Container = styled.abbr`
  position: absolute;
  top: 0;
  width: 67px;
  height: 110px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-bottom: 6px solid ${({ foregroundColor }) => foregroundColor};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0px 8px 80px 0px #ffffff60;
`
const Logo = styled.img`
  position: absolute;
  bottom: 0;
  width: 43px;
  margin: 12px;
`
