/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import styled from 'styled-components'

import type { WikidataLink } from 'redux/state'
import type { IntlShape } from 'react-intl'

import AddWikidata from './AddWikidata'
import { SearchWikidata } from './SearchWikidata'
import { orderedSchemas } from './schema'

type Props = {
  editing: boolean,
  wikidataLinksPath: string,
  onChange: (wikidataLinks: WikidataLink[]) => mixed,
  wikidataLinks: WikidataLink[],
  intl: IntlShape,
}

/**
 * LinkWikidata component with optimized performance
 * Instead of updating the entire case on each change,
 * this implementation batches updates and minimizes rerenders
 */
const LinkWikidata = ({
  editing,
  wikidataLinks = [],
  onChange,
  wikidataLinksPath,
  intl,
}: Props) => {
  // Use memo to prevent recomputing this on every render
  const linksBySchema = React.useMemo(() => {
    const result = {}
    // Use the fixed SCHEMAS array
    for (let i = 0; i < orderedSchemas.length; i++) {
      const schema = orderedSchemas[i]
      result[schema] = wikidataLinks.filter(link => link.schema === schema)
    }
    return result
  }, [wikidataLinks])

  // Handle schema-specific link changes
  const handleSchemaChange = React.useCallback(
    (schema, updatedSchemaLinks) => {
      // Create new array with all links except those with the current schema
      const otherLinks = wikidataLinks.filter(link => link.schema !== schema)

      // Combine with updated links for this schema - add fallback empty array
      const allLinks = [...otherLinks, ...(updatedSchemaLinks || [])]

      // Update parent state with complete new array
      onChange(allLinks)
    },
    [wikidataLinks, onChange]
  )

  return (
    <CatalogSection>
      <Container>
      <SectionTitle>
              <div className="wikidata-title">
                <FormattedMessage id="catalog.wikidata.linkWikidata" />
              </div>
            </SectionTitle>
        {editing && (
          <>
           
            <div className="wikidata-instructions">
              <FormattedMessage id="catalog.wikidata.wikidataInstructions" />
              <LearnMoreLink
                target="_blank"
                href="https://docs.learngala.com/docs/authoring-adding-rich-metadata"
              >
                <span className="learn-more-text">Learn more</span> ›
              </LearnMoreLink>
            </div>
            <SearchWikidata />
          </>
        )}

        <div className="wikidata-container" style={editing ? { gap: '24px' } : {gap: '4px' }}>
          {orderedSchemas.map(schema => (
            <AddWikidata
              key={schema}
              editing={editing}
              schema={schema}
              wikidataLinks={linksBySchema[schema] || []}
              wikidataLinksPath={wikidataLinksPath}
              onChange={updatedLinks =>
                handleSchemaChange(schema, updatedLinks)
              }
            />
          ))}
        </div>
      </Container>
    </CatalogSection>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .wikidata-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
  }

  .wikidata-instructions {
    font-size: 13px;
    color: #ebeae3;
    opacity: 0.8;
    margin-top: -8px;
    margin-bottom: 12px;
  }

  .wikidata-container {
    display: flex;
    flex-direction: column;
  }

  .wikidata-info-sign {
    background: rgba(139, 148, 156, 0.15);
  }
`

const LearnMoreLink = styled.a`
  padding-left: 0.5rem;
  color: white;

  .learn-more-text {
    text-decoration: underline;
  }

  &:hover {
    .learn-more-text {
      text-decoration: underline;
    }
    color: #6acb72;
  }
`

export default injectIntl(LinkWikidata)
