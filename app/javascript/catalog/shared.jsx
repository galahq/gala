/**
 * @flow
 */

import React from 'react' // eslint-disable-line no-unused-vars
import styled from 'styled-components'

export const Main = styled.main`
  grid-area: main;
  min-height: 300px;
`

export const SectionTitle = styled.h2`
  font-family: ${p => p.theme.sansFont};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #ebeae4;
  margin: 0px 0 10px;
  line-height: 1.2;
`

export const CatalogSection = styled.section`
  position: relative;
  overflow: hidden;
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

type ElementProps = {
  image?: ?string,
  className?: ?string,
  text: string,
  href?: ?string,
  rightElement?: *,
}
export const Element = ({
  image,
  text,
  href,
  rightElement,
  className,
}: ElementProps) => {
  const ElementContainer = href == null ? CaseRow : CaseLinkRow
  return (
    <ElementContainer href={href} className={className}>
      <ElementImage src={image} />
      <ElementText>{text}</ElementText>
      {rightElement}
    </ElementContainer>
  )
}

export const ElementImage = styled.div.attrs({ role: 'presentation' })`
  width: 36px;
  height: 36px;
  border-radius: 2px;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
`
export const ElementText = styled.span`
  color: #ebeae4;
  flex: 1;
  margin: 0 14px;
  line-height: 1.1;

  .pt-tooltip.pt-dark &,
  .pt-dark .pt-tooltip & {
    color: #314354;
  }
`
export const NotificationBadge = styled.span`
  height: 20px;
  color: #c1aef8;
  font-size: 13px;
  letter-spacing: 0.5;
`
