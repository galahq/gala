/**
 * @providesModule Identicon
 * @flow
 */

import React from 'react'
import styled, { css } from 'styled-components'

import { identigradient } from 'shared/identigradient'

const NBSP = '\u00A0'

export const identiconStyle = ({
  image,
  hashKey,
  text,
  width,
}: {
  image: string,
  hashKey: string,
  text: string,
  width: number,
}) => css`
  background-image: ${({ image, hashKey }) =>
    image ? `url(${image})` : identigradient(hashKey)};
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: '${({ text, image }) => (image ? NBSP : text[0])}';
    font-weight: 600;
    color: #ebeae4;
    font-size: ${({ width }) => (width >= 25 ? '16px' : '12px')};
  }
`

// $FlowFixMe
const IdenticonDiv = styled.div.attrs(props => ({
  'aria-label': props.presentational ? null : props.text,
  'aria-hidden': props.presentational ? 'true' : null,
  role: props.presentational ? 'presentational' : null,
  className: 'Identicon',
}))`
  width: ${({ width }) => `${width}px`};
  height: ${({ width }) => `${width}px`};
  border-radius: 2px;
  background-size: cover;
  background-position: center;
  ${identiconStyle};
`

const Identicon = ({
  reader,
  width = 36,
  presentational,
  className,
}: {
  reader: { imageUrl: ?string, hashKey: string, name: string },
  width?: number,
  presentational?: boolean,
  className?: string,
}) => (
  <IdenticonDiv
    presentational={presentational}
    width={width}
    image={reader.imageUrl}
    hashKey={reader.hashKey}
    text={reader.name}
    className={className}
  />
)

export default Identicon
