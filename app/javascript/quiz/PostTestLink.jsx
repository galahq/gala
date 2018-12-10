/**
 * @providesModule PostTestLink
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

// $FlowFixMe
const PurpleTOCFooterButton = styled(Link)`
  background-color: #373566;
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
