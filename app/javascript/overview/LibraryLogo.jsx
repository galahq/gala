/**
 * @providesModule LibraryLogo
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import type { Library } from 'redux/state'

const LibraryLogo = ({ library }: { library: Library }) => (
  <Container
    title={library.name}
    href={window.location.pathname.replace(
      /cases.*/,
      `catalog/libraries/${library.slug}`
    )}
    {...library}
  >
    <Logo src={library.logoUrl} />
  </Container>
)
export default LibraryLogo

const Container = styled.a`
  position: absolute;
  top: 0;
  width: 67px;
  height: 110px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-bottom: 6px solid ${({ foregroundColor }) => foregroundColor};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0px 8px 80px 0px #ebeae460;
  transition: box-shadow ease-out 0.1s;

  &:hover,
  &:focus {
    outline: none;
    box-shadow: 0px 8px 80px 0px #ebeae4d0;
  }
`
const Logo = styled.img`
  position: absolute;
  bottom: 0;
  width: 43px;
  margin: 12px;
`
