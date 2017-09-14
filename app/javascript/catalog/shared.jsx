/**
 * @flow
 */

import React from 'react' // eslint-disable-line no-unused-vars
import styled from 'styled-components'

export const SectionTitle = styled.h2`
  font-family: 'tenso';
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #ebeae4;
  margin: 2px 0 12px;
`

export const CatalogSection = styled.section`
  padding: 10px;

  ${({ solid }) =>
    solid
      ? ` background-color: #415e77;
    border: 1px solid #2b4d67;`
      : ''};
`

export const CaseRow = styled.div`
  color: #ebeae4;
  display: flex;
  align-items: ${({ baseline }) => (baseline ? 'baseline' : 'center')};
  padding: 4px;
  margin: -5px -4px 9px -4px;
  border: 1px solid transparent;
  transition-timing-function: ease-out;
  transition-duration: 0.1s;
  transition-property: background, border;
`

export const CaseLinkRow = styled(CaseRow.withComponent('a'))`
  &:hover {
    background-color: #415e77;
    border-color: #2b4d67;
    outline: none;
    color: #ebeae4;
  }
`
