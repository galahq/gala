/**
 * Show the keywords assigned to a case in nice bubbles.
 *
 * @providesModule KeywordsDisplay
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import type { Tag } from 'redux/state'

function categoryQueryPath (name) {
  return `/catalog/search?tags[]=${name}`
}

type Props = { tags: Tag[] }
const KeywordsDisplay = ({ tags }: Props) => (
  <>
    <div>
      {tags
        .filter(tag => tag.category)
        .map(({ name, displayName }) => (
          <CategoryTag
            key={name}
            category={displayName}
            href={categoryQueryPath(name)}
          />
        ))}
    </div>

    <div className="pt-dark">
      {tags.filter(tag => !tag.category).map(({ name, displayName }) => (
        <KeywordTag key={name} href={categoryQueryPath(name)}>
          {displayName}
        </KeywordTag>
      ))}
    </div>
  </>
)

export default KeywordsDisplay

const CategoryTag = styled.a.attrs({ className: 'pt-tag pt-large' })`
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

  &:hover {
    color: white;
  }
`

const KeywordTag = styled.a.attrs({ className: 'pt-tag' })`
  margin: 0 0.5em 0.5em 0;
  text-transform: capitalize;

  &:hover {
    color: black !important;
  }
`
