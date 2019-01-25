/**
 * @providesModule LeadCommenter
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import Identicon from 'shared/Identicon'

type Props = {
  reader: { imageUrl: ?string, hashKey: string, name: string },
}

export default function LeadCommenter ({ reader }: Props) {
  return (
    <Container>
      <Identicon presentational width={32} reader={reader} />
      <cite>{reader.name}</cite>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: baseline;

  & > cite {
    font-style: normal;
    margin-left: 12px;
  }
`
