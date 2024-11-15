/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from './keywords/KeywordsChooser'
import KeywordsDisplay from './keywords/KeywordsDisplay'
import TaggingsManager from './keywords/TaggingsManager'
import { Icon, IconSize } from '@blueprintjs/core'
import styled from 'styled-components'

import type { Tag } from 'redux/state'
import AddWikidata from './AddWikidata'

type Props = {
  editing: boolean,
  onChange: (Tag[]) => mixed,
  taggingsPath: string,
  tags: Tag[],
}
class LinkWikidata extends React.Component<Props> {
  taggingsManager = new TaggingsManager(this.props.taggingsPath)

  render () {
    const { editing, onChange, tags } = this.props
    if (tags.length === 0 && !editing) return null

    return (
      <CatalogSection>
        <Container>
            <SectionTitle>
                <div className="wikidata-title">
                    <FormattedMessage id="catalog.wikidata.linkWikidata" />
                    <Icon icon="info-sign" iconSize={14} />
                </div>
            </SectionTitle>

            <div className="wikidata-instructions">
                <FormattedMessage id="catalog.wikidata.wikidataInstructions" />
            </div>

            <AddWikidata editing={true} title="software" />
            <AddWikidata editing={true} title="hardware" />
            <AddWikidata editing={true} title="grants" />
            <AddWikidata editing={true} title="works" />
        </Container>
      </CatalogSection>
    )
  }
}

export default LinkWikidata

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .wikidata-title {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .wikidata-instructions {
    font-size: 13px;
    color: #EBEAE3;
    opacity: 0.6;
    margin-top: -8px;
  }
`
