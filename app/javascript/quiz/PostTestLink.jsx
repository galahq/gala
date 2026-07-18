/**
 * @providesModule PostTestLink
 *
 */

import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const PurpleTOCFooterButton = styled(Link)`
  background-color: #373566;
  /* Prod's label is white. The TOC is a bp6-dark context, so BP6's dark link rule
     (.bp6-dark a, 0,2,0) colors it light purple; !important (as the hover already uses)
     is needed to force white. */
  color: #fff !important;
  border-radius: 0 0 2pt 2pt;
  font-size: 0.8em;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0.75em;
  text-align: center;
  text-transform: uppercase;
  width: 100%;

  &:hover {
    color: white !important;
    background-color: #46447b;
  }
`

const PostTestLink = () => (
  <PurpleTOCFooterButton to="/quiz">
    Check your understanding
  </PurpleTOCFooterButton>
)

export default PostTestLink
