/**
 * @providesModule CaseKeywords
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from './keywords/KeywordsChooser'
import KeywordsDisplay from './keywords/KeywordsDisplay'
import TaggingsManager from './keywords/TaggingsManager'

import type { Tag } from 'redux/state'

type Props = {
  editing: boolean,
  onChange: (Tag[]) => mixed,
  taggingsPath: string,
  tags: Tag[],
}
class CaseKeywords extends React.Component<Props> {
  taggingsManager = new TaggingsManager(this.props.taggingsPath)

  render () {
    const { editing, onChange, tags } = this.props
    if (tags.length === 0 && !editing) return null

    return (
      <CatalogSection>
        <SectionTitle>
          <FormattedMessage id="catalog.keywords" />
        </SectionTitle>

        {editing ? (
          <KeywordsChooser
            taggingsManager={this.taggingsManager}
            tags={tags}
            onChange={onChange}
          />
        ) : (
          <KeywordsDisplay tags={tags} />
        )}
      </CatalogSection>
    )
  }
}
export default CaseKeywords
