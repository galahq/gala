/**
 * @providesModule CaseList
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CaseRow, CaseLinkRow } from 'catalog/shared'

import type { Case } from 'redux/state'

type Props = { cases: Case[], readerIsEditor: boolean }
const CaseList = ({ cases, readerIsEditor }: Props) => (
  <UnstyledList>
    {cases.map(kase => {
      const link = kase.publishedAt || readerIsEditor
      const Row = link ? CaseLinkRow : CaseRow
      return (
        <li key={kase.slug}>
          <Row href={link ? kase.url : undefined}>
            <Image src={kase.smallCoverUrl} />
            <Title>
              <Kicker>
                {kase.kicker}
                {!kase.publishedAt && <Forthcoming />}
              </Kicker>
              {kase.title}
            </Title>
          </Row>
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

const Image = styled.img.attrs({ role: 'presentation' })`
  width: 50px;
  min-width: 50px;
  height: 50px;
  border-radius: 2px;
  margin-right: 1em;
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
