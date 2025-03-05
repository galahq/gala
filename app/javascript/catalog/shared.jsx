/**
 * @flow
 */

import React from 'react' // eslint-disable-line no-unused-vars
import styled, { css } from 'styled-components'

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
  margin-bottom: 1em;
  overflow: hidden;
  padding: 10px;
  position: relative;

  ${({ solid }) =>
    solid &&
    css`
      background-color: #415e77;
      border: 1px solid #2b4d67;
      border-radius: 3px;
    `};
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

// $FlowFixMe
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
  images?: ?(string[]),
  className?: ?string,
  text: string,
  href?: ?string,
  rightElement?: *,
  wide?: Boolean,
}

export const Element = ({
  image,
  images,
  text,
  href,
  rightElement,
  className,
  wide
}: ElementProps) => {
  const ElementContainer = href == null ? CaseRow : CaseLinkRow
  return (
    <ElementContainer href={href} className={className}>
      {images ? <ElementImages srcs={images} /> : <ElementImage src={image} wide={wide} />}

      <ElementText>{text}</ElementText>

      {rightElement}
    </ElementContainer>
  )
}

const ELEMENT_IMAGES_OFFSET = 6

function ElementImages({ srcs }) {
  return (
    <ElementImagesContainer>
      {srcs.slice(0, 3).map(src => (
        <ElementImage key={src} src={src} />
      ))}
    </ElementImagesContainer>
  )
}

// $FlowFixMe
export const ElementImage = styled.div.attrs({ role: 'presentation' })`
  width: ${props => props.wide ? "56px" : "36px"};
  height: 36px;
  border-radius: 2px;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
`

const ElementImagesContainer = styled.div`
  height: 36px;
  position: relative;
  margin-left: -${2 * ELEMENT_IMAGES_OFFSET}px;
  width: calc(36px + ${2 * ELEMENT_IMAGES_OFFSET}px);

  & > ${ElementImage} {
    box-shadow: 0 0 0 2px #35536f;
    position: absolute;
    top: 0;
  }

  & > ${ElementImage}:nth-child(1) {
    left: ${2 * ELEMENT_IMAGES_OFFSET}px;
    z-index: 3;
  }

  & > ${ElementImage}:nth-child(2) {
    left: ${ELEMENT_IMAGES_OFFSET}px;
    opacity: 0.8;
    z-index: 2;
  }

  & > ${ElementImage}:nth-child(3) {
    left: 0px;
    opacity: 0.6;
    z-index: 1;
  }
`

export const ElementText = styled.span`
  color: #ebeae4;
  flex: 1;
  margin: 0 14px;
  line-height: 1.1;

  .bp3-tooltip.bp3-dark &,
  .bp3-dark .bp3-tooltip & {
    color: #314354;
  }
`
export const NotificationBadge = styled.span`
  height: 20px;
  color: #c1aef8;
  font-size: 13px;
  letter-spacing: 0.5;
`
