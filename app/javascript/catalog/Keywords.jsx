/**
 * @providesModule Keywords
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Tag } from 'redux/state'

const sortGroup = (t: Tag) => t.displayName[0]
const groupKeywords = R.pipe(
  R.sortWith([R.ascend(R.prop('displayName'))]),
  R.filter(tag => !tag.category),
  R.groupWith((a, b) => sortGroup(a) === sortGroup(b))
)

type Props = { tags: Tag[] }
const Keywords = ({ tags }: Props) => {
  const keywordGroups = groupKeywords(tags)

  return (
    <CatalogSection>
      <SectionTitle>
        <FormattedMessage id="catalog.keywords" />
      </SectionTitle>

      <Columns>
        {keywordGroups.map(group => (
          <Group key={group[0][0]} keywords={group} />
        ))}
      </Columns>
    </CatalogSection>
  )
}
export default Keywords

const Columns = styled.div`
  columns: auto 10em;
  column-gap: 1em;
  margin-top: 1em;
`

type GroupProps = { keywords: Tag[] }
const Group = ({ keywords }: GroupProps) => {
  return (
    keywords.length > 0 && (
      <GroupContainer>
        <h3>{keywords[0].displayName[0]}</h3>
        <ul>
          {keywords.map(({ name, displayName }) => (
            <li key={name}>
              <a href={`/catalog/search?q=${name}`}>{displayName}</a>
            </li>
          ))}
        </ul>
      </GroupContainer>
    )
  )
}

const GroupContainer = styled.div`
  break-inside: avoid;

  h3 {
    color: #ebeae4;
    font-size: 90%;
    font-weight: 600;
    margin-bottom: 0;
    opacity: 0.5;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    margin: 0.3em 0 1em;
    padding-left: 0;

    li {
      line-height: 1.1;
      margin-bottom: 0.3em;
    }
  }

  a {
    color: #ebeae4;
    text-transform: capitalize;

    &:hover {
      text-decoration: underline;
    }
  }
`
