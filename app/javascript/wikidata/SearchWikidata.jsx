/* @flow */
import React, { useState, useEffect, useCallback } from 'react'
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
  const [copyStatus, setCopyStatus] = useState(null)
  const [copiedItem, setCopiedItem] = useState(null)

  const runQuery = async query => {
    setLoading(true)
    setResults([])
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

  const debouncedRunQuery = useCallback(debounce(runQuery, 300), [])

  const handleQueryChange = e => {
    setQuery(e.target.value)
    if (query.length > 3) {
      debouncedRunQuery(e.target.value)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  const copyToClipboard = item => {
    navigator.clipboard
      .writeText(item.qid)
      .then(() => {
        setCopiedItem(item)
        setCopyStatus('success')
      })
      .catch(err => {
        console.error('Failed to copy:', err)
        setCopyStatus('error')
      })
  }

  const handleInputFocus = () => {
    if (copyStatus) {
      setCopyStatus(null)
      setCopiedItem(null)
    }
  }

  return (
    <>
      {copyStatus && (
        <Callout
          intent={copyStatus === 'success' ? Intent.SUCCESS : Intent.DANGER}
          style={{ marginBottom: '10px' }}
          className="pt-dark"
        >
          {copyStatus === 'success' 
            ? `Copied ${copiedItem.label} (${copiedItem.qid}) to clipboard!` 
            : 'Failed to copy to clipboard'}
        </Callout>
      )}
      <Suggest
        inputProps={{
          placeholder: 'Search Wikidata',
          value: query,
          onChange: handleQueryChange,
          onFocus: handleInputFocus,
          rightElement: query && (
            <Button
              minimal
              icon="cross"
              title="Clear search"
              onClick={handleClear}
            />
          ),
        }}
        items={results}
        itemRenderer={(item, { handleClick, index }) => (
          <MenuItem
            key={`${item.qid}-${index}`}
            label={item.description}
            text={`${item.label} (${item.qid})`}
            onClick={e => {
              handleClick(e)
              copyToClipboard(item)
            }}
          />
        )}
        inputValueRenderer={item => item}
        closeOnSelect={true}
        initialContent={<MenuItem disabled text="Type to search" />}
        noResults={
          <MenuItem
            disabled
            text={
              loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Spinner className="pt-small" intent="primary"/>
                  <span>Searching...</span>
                </div>
              ) : query && results.length === 0 ? (
                'No results'
              ) : (
                'Type to search'
              )
            }
          />
        }
        popoverProps={{ minimal: true }}
        openOnKeyDown={true}
        onItemSelect={item => console.log(item)}
      >
        <InputGroup>
          <Button>Search</Button>
        </InputGroup>
      </Suggest>
    </>
  )
}
