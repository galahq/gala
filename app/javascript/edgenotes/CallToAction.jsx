/**
 * @providesModule CallToAction
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import type { ILinkExpansion } from './expansion/LinkExpansion'

type Props = {
  contents: string,
  expansion: ILinkExpansion,
  canHighlight: boolean,
  selected: boolean,
  websiteUrl: string,
}

export default function CallToAction ({
  contents,
  expansion,
  canHighlight,
  selected,
  websiteUrl,
}: Props) {
  if (!contents && !expansion.linkDomain) return null

  const maybeLink = expansion.hasEmbed ? { as: 'a', href: websiteUrl } : {}

  return (
    <Container>
      <Text highlighted={canHighlight && selected} {...maybeLink}>
        {contents || expansion.linkDomain}
        {!contents || (contents && !contents.trim().endsWith('›')) ? ' ›' : ''}
      </Text>
    </Container>
  )
}

const Container = styled.div`
  max-width: 40em;
`

const Text = styled.span.attrs({
  className: p => (p.highlighted ? 'edge--highlighted' : ''),
  rel: 'noopener noreferrer',
  target: '_blank',
})`
  display: inline;
  line-height: 1;
  margin: 0.25em 0 0 0;

  &:link:hover {
    background-color: #6acb72;
    color: #262626 !important;
    box-shadow: 2pt 0 0 #6acb72, -2pt 0 0 #6acb72;
  }
`
