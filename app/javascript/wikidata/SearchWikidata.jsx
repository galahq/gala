/*  */
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
import Markdown from 'utility/Markdown'

const SectionTitle = styled.h5`
  font-size: 16px;

  &:not(:first-child) {
    margin-top: 2em;
  }
`

const MenuItemContent = styled.div`
  display: flex;
  width: 440px;
  overflow: hidden;

  .item-label {
    flex: 3;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }

  .item-description {
    flex: 2;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.7;
    font-size: 0.9em;
  }
`

const StyledControlGroup = styled(ControlGroup)`
  .wikidata-suggest-popover {
    min-width: 460px;
  }

  /* The popover is pinned to 460px, but the content/menu/items size to their text
     (~390px), so the highlighted item's purple fill didn't span the full popover,
     leaving a navy strip on the right. Force the whole chain — content, menu, and each
     item — to fill the pinned width, and match the content bg to the navy menu so no
     grey seam shows. */
  .wikidata-suggest-popover .bp6-popover-content {
    background-color: rgb(37, 57, 75);
    min-width: 460px;
  }

  .wikidata-suggest-popover .bp6-menu {
    width: 100%;
    min-width: 460px;
  }

  .wikidata-suggest-popover .bp6-menu > li,
  .wikidata-suggest-popover .bp6-menu-item {
    width: 100%;
  }
`

const SearchWikidata = ({ intl, wikidataLinksPath, onChange }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSchema, setSelectedSchema] = useState(orderedSchemas[0])
  const [isOpen, setIsOpen] = useState(false)
  const [detailedItem, setDetailedItem] = useState(null)
  const [error, setError] = useState(null)
  const [schemaError, setSchemaError] = useState(null)

  const isValidQid = (id) => {
    const pattern = /^[A-Za-z][0-9]+$/
    return (
      typeof id === 'string' &&
      (id.startsWith('Q') || id.startsWith('q')) &&
      id.length > 1 &&
      pattern.test(id)
    )
  }

  const runQuery = async (query) => {
    setLoading(true)
    setResults([])
    setError(null)
    setSchemaError(null)
    try {
      if (isValidQid(query)) {
        // If it's a QID, fetch directly
        const response = await Orchard.harvest(`sparql/${selectedSchema}/${query.toUpperCase()}`)
        if (response) {
          setResults([{
            qid: query.toUpperCase(),
            label: response.entityLabel,
            description: response.properties.find(p => p.description)?.description || '',
          }])
        } else {
          setError(intl.formatMessage({ id: 'catalog.wikidata.404Error' }))
        }
      } else if (query.length > 2) {
        // Regular search with schema filtering
        const response = await Orchard.harvest('sparql', {
          query: query.trim(),
          schema: selectedSchema
        })
        setResults(response)
      }
    } catch (error) {
      setResults([])
      if (error.status === 404) {
        setError(intl.formatMessage({ id: 'catalog.wikidata.404Error' }))
      } else {
        setError(error.message)
      }
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }

  const debouncedRunQuery = useCallback(debounce(runQuery, 300), [selectedSchema])

  // select 6's Suggest controls its input via `query`/`onQueryChange` (which passes the
  // query string), not the old inputProps.value/onChange — those are ignored. Receive
  // the string directly.
  const handleQueryChange = (value) => {
    setQuery(value)
    if (value.length > 2) {
      debouncedRunQuery(value)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setError(null)
  }

  const handleSchemaSelect = (schema) => {
    setSelectedSchema(schema)
    if (query && query.length > 2) {
      runQuery(query)
    }
    if (query && selectedItem) {
      fetchDetailedItem(selectedItem.qid)
    }
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
      if (!response) {
        setSchemaError(intl.formatMessage({ id: 'catalog.wikidata.schemaMismatch' }))
      } else {
        setSchemaError(null)
      }
    } catch (error) {
      console.error('Error fetching detailed item:', error)
      setSchemaError(intl.formatMessage({ id: 'catalog.wikidata.schemaMismatch' }))
    }
  }

  const WIKIDATA_URL = 'https://www.wikidata.org/wiki/'

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <Button
          icon="add"
          title="Add"
          intent={Intent.SUCCESS}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <FormattedMessage id="catalog.wikidata.add" />
        </Button>

        <Dialog
          isOpen={isOpen}
          title={intl.formatMessage({ id: 'catalog.wikidata.addDialogTitle' })}
          className="bp6-dark"
          onClose={() => setIsOpen(false)}
        >
          <div className="bp6-dialog-body">
            <StyledControlGroup
              label={<FormattedMessage id="catalog.wikidata.findItem" />}
              className="bp6-vertical"
            >
              <div className="bp6-callout bp6-dark bp6-icon-hand-right">
                <Markdown source={intl.formatMessage({ id: 'catalog.wikidata.findItemInstructions' })} />
              </div>
              <SectionTitle><FormattedMessage id="catalog.wikidata.chooseItemType" /></SectionTitle>
              <div style={{ width: '180px' }}>
                <Select
                  className="bp6-select bp6-fill bp6-dark"
                  filterable={false}
                  items={orderedSchemas}
                  itemRenderer={(item, { handleClick, modifiers: { active, disabled } }) => (
                    <MenuItem
                      active={active}
                      disabled={disabled}
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
                    className="bp6-fill bp6-dark"
                    endIcon="double-caret-vertical"
                    text={schemasMap[selectedSchema]}
                  />
                </Select>
              </div>
              <SectionTitle><FormattedMessage id="catalog.wikidata.findItem" /></SectionTitle>
              <div style={{ width: '400px' }}>
                <Suggest
                  query={query}
                  onQueryChange={handleQueryChange}
                  inputProps={{
                    style: { width: '400px' },
                    placeholder: intl.formatMessage({ id: 'catalog.wikidata.findItemPlaceholder' }),
                    onFocus: handleInputFocus,
                    rightElement: query && (
                      <Button
                        minimal
                        icon="cross"
                        title={intl.formatMessage({ id: 'catalog.wikidata.clearSearch' })}
                        onClick={handleClear}
                      />
                    ),
                  }}
                  items={results}
                  itemRenderer={(item, { handleClick, modifiers: { active, disabled }, ref }) => (
                    <MenuItem
                      ref={ref}
                      active={active}
                      disabled={disabled}
                      key={item.qid}
                      text={
                        <MenuItemContent>
                          <span className="item-label">{item.label}</span>
                          {item.description && (
                            <span className="item-description">{item.description}</span>
                          )}
                        </MenuItemContent>
                      }
                      onClick={handleClick}
                    />
                  )}
                  inputValueRenderer={item => item.qid}
                  closeOnSelect
                  popoverProps={{
                    minimal: true,
                    captureDismiss: true,
                    usePortal: false,
                    popoverClassName: 'wikidata-suggest-popover',
                    targetProps: { style: { width: '100%' } },
                  }}
                  initialContent={<MenuItem disabled text="Type to search or enter QID" />}
                  noResults={
                    <MenuItem
                      disabled
                      text={
                        loading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spinner className="bp6-small" intent="primary" />
                            <span>Searching...</span>
                          </div>
                        ) : error ? (
                          error
                        ) : query && results.length === 0 ? (
                          'No results'
                        ) : (
                          'Type to search or enter QID'
                        )
                      }
                    />
                  }
                  onItemSelect={handleItemSelect}
                />
              </div>
            </StyledControlGroup>

            {selectedItem && (
              <div className="bp6-card bp6-elevation-1" style={{ marginTop: '20px', padding: '15px' }}>
                {/* Bare <h5> collapses to ~13px in BP6 (not in .bp6-running-text);
                    reuse SectionTitle (16px) so it matches prod + the dialog's other
                    headings. */}
                <SectionTitle>{schemasMap[selectedSchema]}</SectionTitle>
                <p>
                  <strong>{selectedItem.label}</strong> ({selectedItem.qid})
                  <br />
                  {selectedItem.description}
                </p>
                {schemaError && (
                  <div className="bp6-callout bp6-intent-danger" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {schemaError}
                  </div>
                )}
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
                  className="bp6-dark"
                >
                  View on Wikidata
                </a>
              </div>
            )}
          </div>
          <div className="bp6-dialog-footer">
            <div className="bp6-dialog-footer-actions">
              <Button text="Cancel" onClick={() => setIsOpen(false)} />
              <Button
                intent={Intent.SUCCESS}
                text={intl.formatMessage({ id: 'helpers.save' })}
                disabled={!selectedItem || schemaError}
                onClick={async () => {
                  try {
                    const response = await Orchard.graft(wikidataLinksPath, {
                      qid: selectedItem.qid,
                      schema: selectedSchema,
                      position: 0,
                    })
                    if (onChange) {
                      onChange(response)
                    }
                    setIsOpen(false)
                    setQuery('')
                    setSelectedItem(null)
                    setDetailedItem(null)
                  } catch (error) {
                    console.error('Error creating Wikidata link:', error)
                  }
                }}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </>
  )
}

export default injectIntl(SearchWikidata)
