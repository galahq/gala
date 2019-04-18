/**
 * @providesModule Keywords
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogDataContext } from 'catalog/catalogData'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import { groupKeywords } from './helpers'

const Keywords = () => {
  const [{ tags }] = React.useContext(CatalogDataContext)

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

const Group = ({ keywords }) => {
  return (
    keywords.length > 0 && (
      <GroupContainer>
        <h3>{keywords[0].displayName[0]}</h3>
        <ul>
          {keywords.map(({ name, displayName }) => (
            <li key={name}>
              <a href={`/catalog/search?tags[]=${name}`}>{displayName}</a>
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
