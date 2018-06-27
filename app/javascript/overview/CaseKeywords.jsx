/**
 * @providesModule CaseKeywords
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

type Props = { tags: string[] }
const CaseKeywords = ({ tags }: Props) => {
  if (tags.length === 0) return null

  return (
    <CatalogSection>
      <SectionTitle>
        <FormattedMessage id="catalog.keywords" />
      </SectionTitle>

      <div>
        {categoryTags(tags).map(category => (
          <CategoryTag key={category} category={category} />
        ))}
      </div>

      <div className="pt-dark">
        {keywordTags(tags).map(tag => <KeywordTag key={tag}>{tag}</KeywordTag>)}
      </div>
    </CatalogSection>
  )
}
export default CaseKeywords

function categoryTags (tags: string[]) {
  return tags
    .filter(tag => tag.startsWith('category:'))
    .map(tag => tag.replace(/^category:/, ''))
}

function keywordTags (tags: string[]) {
  return tags.filter(tag => !tag.startsWith('category:'))
}

const CategoryTag = styled.span.attrs({ className: 'pt-tag pt-large' })`
  background-image: url(${p => require(`images/category-${p.category}.png`)});
  background-position: center;
  background-size: cover;
  font-size: 120% !important;
  font-weight: 600;
  margin: 0 0.5em 0.5em 0;
  text-shadow: 0 0 6px rgba(0,0,0,0.50);
  padding: 0.5em 1em !important;

  &::before {
    content: '${p => p.category}';
    text-transform: capitalize;
  }
`

const KeywordTag = styled.span.attrs({ className: 'pt-tag' })`
  margin: 0 0.5em 0.5em 0;
  text-transform: capitalize;
`
