/**
 * @providesModule CaseKeywords
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from './keywords/KeywordsChooser'
import KeywordsDisplay from './keywords/KeywordsDisplay'

import type { Tag } from 'redux/state'

type Props = { editing: boolean, onChange: (Tag[]) => mixed, tags: Tag[] }
const CaseKeywords = ({ editing, onChange, tags }: Props) => {
  if (tags.length === 0 && !editing) return null

  return (
    <CatalogSection>
      <SectionTitle>
        <FormattedMessage id="catalog.keywords" />
      </SectionTitle>

      {editing ? (
        <KeywordsChooser tags={tags} onChange={onChange} />
      ) : (
        <KeywordsDisplay tags={tags} />
      )}
    </CatalogSection>
  )
}
export default CaseKeywords
