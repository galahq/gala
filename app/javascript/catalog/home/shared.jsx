/**
 * @providesModule Shared
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

export const FeaturesCell = styled.li`
  background-color: #35536f;
  border-radius: 2pt;
  display: block;

  &:nth-child(-n + 2) {
    @media (min-width: 901px) {
      grid-column-end: span 2;
    }
  }
`

