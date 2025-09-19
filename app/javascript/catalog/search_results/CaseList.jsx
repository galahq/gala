/**
 * @providesModule CaseList
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CaseLinkRow } from 'catalog/shared'

import type { Case } from 'redux/state'

type Props = { cases: Case[], readerIsEditor: boolean }
const CaseList = ({ cases, readerIsEditor }: Props) => (
  <UnstyledList>
    {cases.map(kase => {
      return (
        <li key={kase.slug}>
          <CaseLinkRow href={kase.links.self}>
            <ImageContainer>
              <Image src={kase.smallCoverUrl} />
              {kase.library && (
                <LibraryLogoOverlay src={kase.library.logoUrl} title={"In library: " + kase.library.name} alt={kase.library.name} />
              )}
            </ImageContainer>
            <Title>
              <Kicker>
                {kase.kicker}
                {!kase.publishedAt && <Forthcoming />}
              </Kicker>
              {kase.title}
            </Title>
          </CaseLinkRow>
        </li>
      )
    })}
  </UnstyledList>
)

export default CaseList

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const ImageContainer = styled.div`
  position: relative;
  width: 50px;
  min-width: 50px;
  height: 50px;
  margin-right: 1em;
`

const Image = styled.img.attrs({ role: 'presentation' })`
  width: 100%;
  height: 100%;
  border-radius: 2px;
  object-fit: cover;
`

const Kicker = styled.span`
  display: block;
  font-weight: 600;
`
const Title = styled.div.attrs({ className: 'pt-dark' })`
  line-height: 1.3;
`

const ForthcomingTag = styled.span.attrs({
  className: 'pt-tag pt-minimal',
})`
  margin-left: 0.5em;
  font-weight: 500;
`
const Forthcoming = () => (
  <ForthcomingTag>
    <FormattedMessage id="cases.show.forthcoming" />
  </ForthcomingTag>
)

const LibraryLogoOverlay = styled.img`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  object-fit: contain;
  background-color: rgba(16, 22, 26, .3);
  padding: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`
