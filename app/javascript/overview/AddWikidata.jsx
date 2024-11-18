/**
 * @providesModule AddWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import SortableList, { createSortableInput } from '../utility/SortableList'
import type { Wikidata } from 'redux/state'

type Props = {
  editing: boolean,
  title: string
}

const isValidWikidataKey = (key: string): boolean => {
    return ['software', 'hardware', 'grants', 'works'].includes(key)
}

const AddWikidata = ({ editing, title }: Props): React.Node => {
    const [state, setState] = React.useState<Wikidata>({
        software: [],
        hardware: [],
        grants: [],
        works: [],
    })

    const handleChange = (items: Array<string>) => {
        setState(prevState => ({
            ...prevState,
            [title]: items,
        }))
    }

    if (!editing || !isValidWikidataKey(title)) return null

    const items = state[title] || []

    return (
        <Container>
            <div className="pt-dark">
                <div className="wikidata-title">
                    <FormattedMessage id={`catalog.wikidata.${title}`} />
                </div>
                <SortableList
                    dark
                    items={items}
                    newItem=""
                    render={WikiDataInput}
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
        color: #EBEAE3;
        font-size: 14px;
        font-weight: 700;
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

export default AddWikidata
