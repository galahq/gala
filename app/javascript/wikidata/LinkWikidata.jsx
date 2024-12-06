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
import Sparqler from './Sparqler'

type Props = {
  editing: boolean,
  wikidataLinksPath: string,
  onChange: (wikidataLinks: WikidataLink[]) => mixed,
  wikidataLinks: WikidataLink[],
  intl: IntlShape,
}
const LinkWikidata = ({
  editing,
  wikidataLinks,
  onChange,
  wikidataLinksPath,
  intl,
}: Props) => {
  const schemas = ['researchers', 'software', 'hardware', 'grants', 'works']

  return (
    <CatalogSection>
      <Container>
        {editing && (
          <>
            <SectionTitle>
              <div className="wikidata-title">
                <FormattedMessage id="catalog.wikidata.linkWikidata" />
              </div>
            </SectionTitle>
            <div className="wikidata-instructions">
              <FormattedMessage id="catalog.wikidata.wikidataInstructions" />
              <LearnMoreLink
                target="_blank"
                href="https://docs.learngala.com/docs/authoring-adding-rich-metadata"
              >
                <span className="learn-more-text">Learn more</span> ›
              </LearnMoreLink>
            </div>
            <Sparqler />
          </>
        )}

        <div className="wikidata-container">
          {schemas.map(schema => (
            <AddWikidata
              key={schema}
              editing={editing}
              schema={schema}
              wikidataLinks={wikidataLinks}
              wikidataLinksPath={wikidataLinksPath}
              onChange={onChange}
            />
          ))}
        </div>
      </Container>
    </CatalogSection>
  )
}

export default injectIntl(LinkWikidata)

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
    gap: 24px;
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
