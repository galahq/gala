/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import styled from 'styled-components'
import { Popover, Position } from '@blueprintjs/core'

import type { WikidataLink } from 'redux/state'
import type { IntlShape } from 'react-intl'

import AddWikidata from './AddWikidata'
import SearchWikidata from './SearchWikidata'
import { orderedSchemas } from './schema'

type Props = {
  editing: boolean,
  wikidataLinksPath: string,
  onChange: (wikidataLinks: WikidataLink[]) => mixed,
  wikidataLinks: WikidataLink[],
  intl: IntlShape,
}

const PopoverContent = styled.div`
  padding: 1em;
  max-width: 400px;

  .learn-more-link {
    &:after {
      content: '›';
      margin-left: 0.25rem;
    }
  }
`

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

  if (!editing && wikidataLinks.length === 0) {
    return null
  }

  return (
    <CatalogSection>
      <Container>
        <SectionTitle>
          <div className="wikidata-title pt-dark">
            <FormattedMessage id="catalog.wikidata.linkWikidata" />
            <Popover
              content={
                <PopoverContent>
                  <FormattedMessage id="catalog.wikidata.aboutWikidata" />
                  <a 
                    href="https://www.wikidata.org/wiki/Wikidata:Introduction" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="learn-more-link"
                  >
                    <FormattedMessage id="catalog.learnMore" />
                  </a>
                </PopoverContent>
              }
              position={Position.RIGHT}
              className="pt-dark"
            >
              <button className="pt-button pt-minimal pt-icon-help" aria-label="Help" />
            </Popover>
          </div>
        </SectionTitle>
        {editing && (
          <>
            <SearchWikidata 
              wikidataLinksPath={wikidataLinksPath} 
              onChange={(newLink) => {
                const updatedLinks = [...wikidataLinks, newLink]
                onChange(updatedLinks)
              }}
            />
          </>
        )}

        <div className="wikidata-container" style={editing ? { gap: '24px' } : {gap: '4px' }}>
          {orderedSchemas.map(schema => {
            const schemaLinks = linksBySchema[schema] || []
            return schemaLinks.length > 0 ? (
              <AddWikidata
                key={schema}
                editing={editing}
                schema={schema}
                wikidataLinks={schemaLinks}
                wikidataLinksPath={wikidataLinksPath}
                onChange={updatedLinks =>
                  handleSchemaChange(schema, updatedLinks)
                }
              />
            ) : null
          })}
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

  .wikidata-container {
    display: flex;
    flex-direction: column;
  }

  .wikidata-info-sign {
    background: rgba(139, 148, 156, 0.15);
  }
`

export default injectIntl(LinkWikidata)
