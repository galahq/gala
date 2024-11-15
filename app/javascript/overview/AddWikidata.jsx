/**
 * @providesModule AddWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'

import styled from 'styled-components'
import SortableList, { createSortableInput } from '../utility/SortableList'

type Props = {
  editing: boolean,
  title: string
}
const AddWikidata = (props: Props) => {
    const { editing, title } = props
    if (!editing) return null

    return (
      <Container>
        <div className="wikidata-title">
          <FormattedMessage id={`catalog.wikidata.${title}`} />
        </div>
        <SortableList
            dark
            items={[]}
            newItem=""
            render={WikiDataInput}
            onChange={() => {}}
        />
        <AddButton><FormattedMessage id={`catalog.wikidata.add`} /></AddButton>
      </Container>
    )
}

export default AddWikidata

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .wikidata-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #EBEAE3;
    font-size: 14px;
    font-weight: 700;
    margin-top: 24px;
  }

  .wikidata-instructions {
    font-size: 13px;
    color: #EBEAE3;
    opacity: 0.6;
    margin-top: -8px;
  }
`

const AddButton = styled.button.attrs({
    className: 'pt-button pt-intent-success',
  })`
    margin-top: 0.5em;
    width: 44px;
  `

const WikiDataInput = createSortableInput({
    placeholderId: 'catalog.wikidata.wikidataPlaceholder',
})
