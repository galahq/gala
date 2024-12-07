/* @flow */
import React, { useState, useEffect } from 'react'
import {
  InputGroup,
  Button,
  Intent,
  Card,
  Elevation,
  Spinner,
  Callout,
  MenuItem,
} from '@blueprintjs/core'
import { Select, Suggest } from '@blueprintjs/select'
import { Orchard } from 'shared/orchard'
import styled from 'styled-components'
import { debounce } from 'lodash'

export const SearchWikidata = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const runQuery = async (query) => {
    setLoading(true)
    try {
      const response = await Orchard.harvest('sparql', { query: query.trim() })
      console.log(response)
      setResults(response) // Assuming `response` contains results
    } catch (error) {
      setResults([])
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }

  const debouncedRunQuery = debounce(runQuery, 500)

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    debouncedRunQuery(e.target.value)
  }

  return (
    <Suggest
      inputProps={{
        placeholder: 'Search Wikidata',
        value: query,
        onChange: handleQueryChange,
      }}
      items={results}
      itemRenderer={(item, { handleClick }) => (
        <MenuItem key={item} text={item} onClick={handleClick} />
      )}
      inputValueRenderer={(item) => item}
      closeOnSelect={true}
      initialContent={<MenuItem disabled text="Type to search" />}
      noResults={
        <MenuItem
          disabled
          text={
            query && !loading && results.length === 0
              ? 'No results'
              : 'Loading...'
          }
        />
      }
      popoverProps={{ minimal: true }}
      openOnKeyDown={true}
      onItemSelect={(item) => console.log(item)}
    >
      <InputGroup>
        <Button>Search</Button>
      </InputGroup>
    </Suggest>
  )
}

// const SCHEMAS = {
//   researchers: "Researchers",
//   software: "Software",
//   hardware: "Hardware",
//   grants: "Grants",
//   works: "Works",
// }
