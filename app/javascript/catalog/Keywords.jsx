/**
 * @providesModule Keywords
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

const keywords = [
  'Adaptation',
  'Agriculture',
  'Awareness Raising',
  'Biodiversity',
  'Bioenergy',
  'Climate',
  'Conservation',
  'Cost Benefit Analysis',
  'Cradle to Cradle',
  'Deforestation',
  'Design',
  'Development',
  'Disaster',
  'Diversity',
  'Ecology',
  'Ecosystem',
  'Energy',
  'Equity',
  'Externality',
  'Farming',
  'Finance',
  'Food Chain',
  'Footprint',
  'Geothermal',
  'Globalization',
  'Governance',
  'Greenhouse Effect',
  'Human Rights',
  'Integration',
  'Investment',
  'Justice',
  'Land',
  'LEED',
  'Life Cycle',
  'Marine',
  'Materials',
  'Nature',
  'Nutrition',
  'Oceans',
  'Planning',
  'Policy',
  'Politics',
  'Poverty',
  'Public Health',
  'Race',
  'Recycling',
  'Rights',
  'Rural',
  'Social',
  'Solar',
  'Stakeholders',
  'Stewardship',
  'Supply Chain',
  'Systems Thinking',
  'Technology',
  'Tradeoffs',
  'Transportation',
  'Triple Bottom Line',
  'Underserved',
  'Unintended Consequence',
  'Urban',
  'Water',
  'Wind',
  'Women',
]

const Keywords = () => {
  const keywordGroups = R.groupWith((a, b) => a[0] === b[0], keywords).sort()

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

type GroupProps = { keywords: string[] }
const Group = ({ keywords }: GroupProps) => {
  console.log(keywords)
  return (
    keywords.length > 0 && (
      <GroupContainer>
        <h3>{keywords[0][0]}</h3>
        <ul>
          {keywords.map(keyword => (
            <li key={keyword}>
              <a href={`/catalog/search?q=${keyword}`}>{keyword}</a>
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
    color: #EBEAE4;
    font-size: 90%;
    font-weight: 600;
    margin-bottom: 0;
    opacity: 0.5;
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
    color: #EBEAE4;

    &:hover {
      text-decoration: underline;
    }
  }
`
