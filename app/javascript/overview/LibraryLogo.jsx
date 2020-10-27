/**
 * @providesModule LibraryLogo
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { opacify } from 'polished'

import { Container as TitleCardContainer } from 'shared/TitleCard'

import type { Library } from 'redux/state'

const LibraryLogo = ({
  library,
  href,
}: {
  library: Library,
  href?: string,
}) => (
  <Container
    title={library.name}
    href={
      href ||
      window.location.pathname.replace(
        /cases.*/,
        `catalog/libraries/${library.slug}`
      )
    }
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
  height: 80px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-bottom: 6px solid ${({ foregroundColor }) => foregroundColor};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0px 8px 80px 0px #ebeae460;
  box-shadow: 0px 1px 1px hsla(209, 80%, 10%, 0.05),
    0px 2px 6px hsla(209, 80%, 10%, 0.1);
  transition: box-shadow ease-out 0.1s, background ease-out 0.1s;

  ${TitleCardContainer} & {
    left: 10px;
  }

  &[href]:hover,
  &:focus {
    background-color: ${p => opacify(0.1, p.backgroundColor)};
    border-bottom-color: ${p => opacify(0.1, p.foregroundColor)};
    outline: none;
    box-shadow: 0px 8px 80px 0px #ebeae4d0;
    box-shadow: 0px 2px 4px hsla(209, 80%, 10%, 0.05),
      0px 8px 24px hsla(209, 80%, 10%, 0.2);
  }
`
const Logo = styled.img`
  position: absolute;
  bottom: 0;
  width: 43px;
  margin: 12px;
`
