/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import styled from 'styled-components'
import AddWikidata from './AddWikidata'


type Props = {
  editing: boolean,
}
const LinkWikidata = ({ editing, intl }: Props) => {
  const schemas = ['researchers', 'software', 'hardware', 'grants', 'works']
  const [openDialog, setOpenDialog] = React.useState(false)
  if (!editing) return null

  return (
    <CatalogSection>
      <Container>
        <SectionTitle>
          <div className="wikidata-title">
            <FormattedMessage id="catalog.wikidata.linkWikidata" />
          </div>
        </SectionTitle>

        <div className="wikidata-instructions">
          <FormattedMessage id="catalog.wikidata.wikidataInstructions" /><LearnMoreLink target="_blank" href="https://docs.learngala.com/docs/authoring-adding-rich-metadata">Learn more ›</LearnMoreLink>
        </div>

        <div className="wikidata-container">
          {
            schemas.map((schema) => (<AddWikidata key={schema} editing={editing} schema={schema} />))
          }
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

  .wikidata-info-sign {
    background: rgba(139,148,156,.15);
  }
`

const LearnMoreLink = styled.a`
padding-left: .5rem;
color: #6ACB72;

&:hover {
  text-decoration: underline;
  color: #6ACB72;
}
`