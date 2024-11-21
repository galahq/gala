/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from '../overview/keywords/KeywordsChooser'
import KeywordsDisplay from '../overview/keywords/KeywordsDisplay'
import TaggingsManager from '../overview/keywords/TaggingsManager'
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

            <div className="wikidata-container">
                <AddWikidata editing={true} schema="researchers" />
                <AddWikidata editing={true} schema="software" />
                <AddWikidata editing={true} schema="hardware" />
                <AddWikidata editing={true} schema="grants" />
                <AddWikidata editing={true} schema="works" />
            </div>
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
    opacity: 0.8;
    margin-top: -8px;
    margin-bottom: 12px;
  }

  .wikidata-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`
