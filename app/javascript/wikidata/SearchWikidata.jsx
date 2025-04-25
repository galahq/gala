/* @flow */
import React, { useState, useCallback } from 'react'
import {
  Button,
  Intent,
  Spinner,
  MenuItem,
  ControlGroup,
  Dialog,
} from '@blueprintjs/core'
import { Suggest, Select } from '@blueprintjs/select'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Orchard } from 'shared/orchard'
import { debounce } from 'lodash'
import { orderedSchemas, schemasMap } from './schema'
import styled from 'styled-components'

const SectionTitle = styled.h5`
  &:not(:first-child) {
    margin-top: 2em;
  }
`

const StyledControlGroup = styled(ControlGroup)`
  .wikidata-suggest-popover {
    min-width: 500px;
  }
`

const SearchWikidata = ({ intl }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSchema, setSelectedSchema] = useState(orderedSchemas[0])
  const [isOpen, setIsOpen] = useState(false)
  const [detailedItem, setDetailedItem] = useState(null)

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

  const handleSchemaSelect = (schema) => {
    setSelectedSchema(schema)
  }

  const handleItemSelect = (item) => {
    setSelectedItem(item)
    fetchDetailedItem(item.qid)
  }

  const handleInputFocus = () => {
    if (selectedItem) {
      setSelectedItem(null)
    }
  }

  const fetchDetailedItem = async (qid) => {
    try {
      const response = await Orchard.harvest(`sparql/${selectedSchema}/${qid}`)
      setDetailedItem(response)
    } catch (error) {
      console.error('Error fetching detailed item:', error)
    }
  }

  const WIKIDATA_URL = 'https://www.wikidata.org/wiki/'

  return (
    <>
      <div style={{ marginBottom: '12px', width: '100%' }}>
        <Button
          icon="add"
          title="Add"
          text="Add"
          intent={Intent.SUCCESS}
          onClick={() => setIsOpen(prev => !prev)}
        />

        <Dialog
          isOpen={isOpen}
          title="Add a Wikidata item"
          className="pt-dark"
          onClose={() => setIsOpen(false)}
        >
          <div className="pt-dialog-body">
            <StyledControlGroup
              label='Find a Wikidata item'
              className="pt-vertical"
            >
              <SectionTitle>Choose an item type</SectionTitle>
              <div style={{ width: '200px' }}>
                <Select
                  className="pt-select pt-fill pt-dark"
                  filterable={false}
                  items={orderedSchemas}
                  itemRenderer={(item, { handleClick, modifiers }) => (
                    <MenuItem
                      {...modifiers}
                      key={item}
                      text={schemasMap[item]}
                      onClick={handleClick}
                    />
                  )}
                  popoverProps={{
                    minimal: true,
                    captureDismiss: true,
                    usePortal: false,
                  }}
                  onItemSelect={handleSchemaSelect}
                >
                  <Button
                    className="pt-fill pt-dark"
                    text={schemasMap[selectedSchema]}
                  />
                </Select>
              </div>
              <SectionTitle>Find a Wikidata item</SectionTitle>
              <div style={{ width: '400px' }}>
              <Suggest
                inputProps={{
                  style: { width: '400px' },
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
                itemRenderer={(item, { handleClick, modifiers }) => (
                  <MenuItem
                    {...modifiers}
                    key={item.qid}
                    label={item.description && item.description.length > 40 ? `${item.description.slice(0, 40)}...` : item.description}
                    text={`${item.label}`}
                    onClick={handleClick}
                  />
                )}
                inputValueRenderer={item => item}
                closeOnSelect={false}
                popoverProps={{
                  minimal: true,
                  captureDismiss: true,
                  usePortal: false,
                  popoverClassName: 'wikidata-suggest-popover',
                  targetProps: { style: { width: '100%' } }
                }}

                initialContent={<MenuItem disabled text="Type to search" />}
                noResults={
                  <MenuItem
                    disabled
                    text={
                      loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Spinner className="pt-small" intent="primary" />
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
                onItemSelect={handleItemSelect}
              />
              </div>
            </StyledControlGroup>

            {selectedItem && (
              <div className="pt-card pt-elevation-1" style={{ marginTop: '20px', padding: '15px' }}>
                <h5>Selected {schemasMap[selectedSchema]}</h5>
                <p>
                  <strong>{selectedItem.label}</strong> ({selectedItem.qid})
                  <br />
                  {selectedItem.description}
                </p>
                {detailedItem?.properties && (
                  <div className="wikidata-details-section">
                    {detailedItem.properties.map((prop, i) => {
                      const [key, value] = Object.entries(prop)[0]
                      return (
                        value && (
                          <div key={`${key}-${i}-${value}`}>
                            <span className="wikidata-details-text">
                              <span style={{ fontWeight: 400 }}>{key}:</span> {value}
                            </span>
                          </div>
                        )
                      )
                    })}
                  </div>
                )}
                <a
                  href={`${WIKIDATA_URL}${selectedItem.qid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pt-text-link pt-dark"
                >
                  View on Wikidata
                </a>
              </div>
            )}
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button text="Cancel" onClick={() => setIsOpen(false)} />
              <Button
                intent={Intent.SUCCESS}
                text={intl.formatMessage({ id: 'helpers.save' })}
                disabled={!selectedItem}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </>
  )
}

export default injectIntl(SearchWikidata)
