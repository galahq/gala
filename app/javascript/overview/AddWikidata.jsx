/**
 * @providesModule AddWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import SortableList, { createSortableInput } from '../utility/SortableList'
import type { Wikidata } from 'redux/state'
import { Intent, Callout } from '@blueprintjs/core'


import { Orchard } from 'shared/orchard'

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
    const [results, setResults] = React.useState(null)
    const [error, setError] = React.useState(null)
    const [inputIntent, setInputIntent] = React.useState(Intent.NONE)

    const handleChange = React.useCallback((items: Array<string>) => {
        console.log(items)
        setState(prevState => ({
            ...prevState,
            [title]: items,
        }))
    }, [title])

    const handleBlur = React.useCallback((event) => {
        const qId = event.target.value;

        if (isValidQId(qId)) {
            makeQuery(qId)
        }
    }, [])

    const isValidQId = (id) => {
        if (!id.startsWith('Q')) {
          return false
        } else {
          return true
        }
    }

    const makeQuery = (id) => {
        Orchard.harvest('sparql/' + id.trim())
          .then((resp) => {
            if (Array.isArray(resp) && resp.length === 0) {
              setError('No results found')
              setResults(null)
              setInputIntent(Intent.DANGER)
            } else {
              setResults(resp)
              setError(null)
              setInputIntent(Intent.SUCCESS)
            }
          })
          .catch((err) => {
            setError(err.message)
            setResults(null)
            setInputIntent(Intent.DANGER)
          })
    }

    const renderInput = React.useCallback((props) => (
        <WikiDataInput {...props} intent={inputIntent} onBlur={handleBlur} />
    ), [handleBlur])

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
                    render={renderInput}
                    onChange={handleChange}
                />
                {error && <Callout intent={Intent.DANGER} title="Error">{error}</Callout>}
                {results && (
                    <Callout intent={Intent.SUCCESS} title="Results">
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                    </Callout>
                )}
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

const WikiDataInput = createSortableInput({
    placeholderId: 'catalog.wikidata.wikidataPlaceholder',
})

export default AddWikidata
