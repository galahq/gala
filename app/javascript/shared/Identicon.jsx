/**
 * @providesModule Identicon
 * @flow
 */

import React from 'react'
import styled, { css } from 'styled-components'

import { identigradient } from 'shared/identigradient'

import type { Reader } from 'redux/state'

export const identiconStyle = ({
  image,
  hashKey,
  text,
}: {
  image: string,
  hashKey: string,
  text: string,
}) => css`
  background: ${({ image, hashKey }) =>
    image ? `url(${image})` : identigradient(hashKey)};
  display: flex;
  align-items: center;
  justify-content: center;
  &::after {
    content: ${({ text, image }) => (image ? '' : `'${text[0]}'`)};
    font-weight: 600;
    color: #ebeae4;
  }
`

const IdenticonDiv = styled.div.attrs({
  'aria-label': ({ text }) => text,
})`
  width: 36px;
  height: 36px;
  border-radius: 2px;
  background-size: cover;
  background-position: center;
  ${identiconStyle};
`

const Identicon = ({ reader }: { reader: Reader }) => (
  <IdenticonDiv
    image={reader.imageUrl}
    hashKey={reader.email}
    text={reader.name}
  />
)
export default Identicon
