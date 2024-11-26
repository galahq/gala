/**
 * @providesModule LinkWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { CatalogSection, SectionTitle } from 'catalog/shared'
import { Icon, Button } from '@blueprintjs/core'
import styled from 'styled-components'

import type { Case, WikidataLink } from 'redux/state'
import type { IntlShape } from 'react-intl'

import AddWikidata from './AddWikidata'
import WikidataDialog from './WikidataDialog'

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
  const [openDialog, setOpenDialog] = React.useState(false)

  return (
    <CatalogSection>
      <Container>
        {editing && (
          <>
            <SectionTitle>
              <div className="wikidata-title">
                <FormattedMessage id="catalog.wikidata.linkWikidata" />
                <InfoButton
                  icon="info-sign"
                  aria-label={intl.formatMessage({
                    id: 'catalog.wikidata.wikidataDialogTitle',
                  })}
                  onClick={() => setOpenDialog(true)}
                />
              </div>
            </SectionTitle>
            <WikidataDialog
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
            />
            <div className="wikidata-instructions">
              <FormattedMessage id="catalog.wikidata.wikidataInstructions" />
            </div>
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

const InfoButton = styled(Button).attrs({
  className: 'pt-minimal pt-button--baseline-aligned',
})`
  color: inherit;
  z-index: 1;

  svg {
    fill: #ebeae3;
    opacity: 0.7;
  }
`
