/**
 * @providesModule AddWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import type { WikidataLink } from 'redux/state'
import SortableWikidataList, {
  createSortableInput,
} from './SortableWikidataList'

type Props = {
  editing: boolean,
  schema: string,
  editing: boolean,
  onChange: (wikidataLinks: WikidataLink[]) => mixed,
  wikidataLinks: WikidataLink[],
  wikidataLinksPath: string,
}

const AddWikidata = ({
  editing,
  schema,
  onChange,
  wikidataLinks,
  wikidataLinksPath,
}: Props): React.Node => {
  const items = wikidataLinks.filter(link => link.schema === schema)

  const handleChange = (updates: WikidataLink[]) => {
    const updatedLinks = [
      ...wikidataLinks.filter(link => link.schema !== schema),
      ...updates,
    ]
    onChange(updatedLinks)
  }

  if (!editing && items.length === 0) {
    return null
  }

  return (
    <Container>
      <div className="pt-dark">
        <div className="wikidata-title">
          <FormattedMessage id={`catalog.wikidata.${schema}`} />
        </div>
        <SortableWikidataList
          dark
          editing={editing}
          items={items}
          newItem={{ id: '', qid: '', schema, position: items.length }}
          render={(props, index) => (
            <WikiDataInput {...props} schema={schema} index={index} />
          )}
          wikidataLinksPath={wikidataLinksPath}
          schema={schema}
          onChange={handleChange}
        />
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .wikidata-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ebeae3;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .wikidata-instructions {
    font-size: 13px;
    color: #ebeae3;
    opacity: 0.6;
    margin-top: -8px;
  }
`

const WikiDataInput = createSortableInput({
  placeholderId: 'catalog.wikidata.wikidataPlaceholder',
})

export default AddWikidata
