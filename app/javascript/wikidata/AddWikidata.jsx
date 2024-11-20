/**
 * @providesModule AddWikidata
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import type { Wikidata } from 'redux/state'
import { Intent, Callout } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import SortableWikidataList, { createSortableInput } from './SortableWikidataList'

type Props = {
  editing: boolean,
  schema: string
}

const isValidWikidataKey = (key: string): boolean => {
    return ['researchers', 'software', 'hardware', 'grants', 'works'].includes(key)
}

const AddWikidata = ({ editing, schema }: Props): React.Node => {
    const [state, setState] = React.useState<Wikidata>({
        researchers: [],
        software: [],
        hardware: [],
        grants: [],
        works: [],
    })
    // const [results, setResults] = React.useState(null)
    // const [error, setError] = React.useState(null)
    // const [inputIntent, setInputIntent] = React.useState(Intent.NONE)

    const handleChange = React.useCallback((items: Array<string>) => {
        setState(prevState => ({
            ...prevState,
            [schema]: items,
        }))
    }, [schema])

    // const handleBlur = React.useCallback((id) => {
    //     const qId = id

    //     if (isValidQId(qId)) {
    //         makeQuery(qId)
    //     }
    // }, [])

    // const isValidQId = (id) => {
    //     if (!id.startsWith('Q')) {
    //       return false
    //     } else {
    //       return true
    //     }
    // }

    // const makeQuery = (id) => {
    //     Orchard.harvest('sparql/' + id.trim())
    //       .then((resp) => {
    //         if (Array.isArray(resp) && resp.length === 0) {
    //           setError('No results found')
    //           setInputIntent(Intent.DANGER)
    //         } else {
    //             setResults((prevResults) => ({
    //                 ...prevResults,
    //                 [id]: resp,
    //               }))
    //               console.log(results)
    //           setError(null)
    //           setInputIntent(Intent.SUCCESS)
    //         }
    //       })
    //       .catch((err) => {
    //         setError(err.message)
    //         setResults(null)
    //         setInputIntent(Intent.DANGER)
    //       })
    // }

    const renderInput = React.useCallback((props) => (
        <WikiDataInput {...props} schema={schema} />
    ), [schema])

    if (!editing || !isValidWikidataKey(schema)) return null

    const items = state[schema] || []

    return (
        <Container>
            <div className="pt-dark">
                <div className="wikidata-title">
                    <FormattedMessage id={`catalog.wikidata.${schema}`} />
                </div>
                <SortableWikidataList
                    dark
                    items={items}
                    newItem=""
                    render={renderInput}
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

const WikiDataInput = createSortableInput({
    placeholderId: 'catalog.wikidata.wikidataPlaceholder',
})

export default AddWikidata
