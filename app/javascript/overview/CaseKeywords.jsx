/**
 * @providesModule CaseKeywords
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Tag } from 'redux/state'

type Props = { tags: Tag[] }
const CaseKeywords = ({ tags }: Props) => {
  if (tags.length === 0) return null

  return (
    <CatalogSection>
      <SectionTitle>
        <FormattedMessage id="catalog.keywords" />
      </SectionTitle>

      <div>
        {tags
          .filter(tag => tag.category)
          .map(({ name, displayName }) => (
            <CategoryTag key={name} category={displayName} />
          ))}
      </div>

      <div className="pt-dark">
        {tags
          .filter(tag => !tag.category)
          .map(({ name, displayName }) => (
            <KeywordTag key={name}>{displayName}</KeywordTag>
          ))}
      </div>
    </CatalogSection>
  )
}
export default CaseKeywords

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
