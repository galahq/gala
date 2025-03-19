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
import { Select } from '@blueprintjs/select'
import { Orchard } from 'shared/orchard'
import { schemasMap } from './schema'
import styled from 'styled-components'

const Sparqler = () => {
  const [state, setState] = useState({
    query: '',
    schema: Object.keys(schemasMap)[0],
    results: null,
    error: null,
    inputIntent: Intent.NONE,
    loading: false,
  })

  const { query, schema, results, error, inputIntent, loading } = state

  const updateState = updates => setState(prev => ({ ...prev, ...updates }))

  const makeQuery = (query, schema) => {
    updateState({ loading: true })
    Orchard.harvest('sparql', { query: query.trim() })
      .then(resp => {
        if (Array.isArray(resp) && resp.length === 0) {
          updateState({
            error: 'No results found',
            results: null,
            inputIntent: Intent.DANGER,
            loading: false,
          })
        } else {
          updateState({
            results: resp,
            error: null,
            inputIntent: Intent.SUCCESS,
            loading: false,
          })
        }
      })
      .catch(err => {
        updateState({
          error: err.message,
          results: null,
          inputIntent: Intent.DANGER,
          loading: false,
        })
      })
  }

  const handleInputChange = e => updateState({ query: e.target.value })
  const handleSchemaChange = newSchema => updateState({ schema: newSchema })
  const handleClear = () =>
    updateState({
      query: '',
      results: null,
      error: null,
      inputIntent: Intent.NONE,
      loading: false,
    })

  useEffect(() => {
    if (query) {
      makeQuery(query, schema)
    }
  }, [query, schema])

  const renderSchemaItem = (schema, { handleClick, modifiers }) => (
    <MenuItem
      key={schema}
      text={schemasMap[schema]}
      active={modifiers.active}
      onClick={handleClick}
    />
  )

  const Feedback = ({ intent, title, children }) => (
    <Callout intent={intent} title={title}>
      {children}
    </Callout>
  )

  const renderResults = () =>
      results && results.map((result, index) => (
      <Card
        key={index}
        elevation={Elevation.TWO}
        style={{ marginBottom: '10px' }}
      >
        {result.image && (
          <img
            src={result.image}
            alt={result.title || 'Result'}
            style={{ maxWidth: '100px', float: 'right', marginLeft: '10px' }}
          />
        )}
        <h5>
          {result.label} ({result.qid})
        </h5>
        <p>{result.description || 'No description available.'}</p>
      </Card>
    ))

  return (
    <div>
      <h2 className="pt-dark">Wikidata</h2>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Select
          items={Object.keys(schemasMap)}
          itemRenderer={renderSchemaItem}
          filterable={false}
          onItemSelect={handleSchemaChange}
        >
          <Button text={schemasMap[schema]} rightIcon="caret-down" />
        </Select>
        <InputGroup
          fill
          placeholder="Query Wikidata"
          value={query}
          intent={inputIntent}
          style={{ marginLeft: '10px', flexGrow: 1 }}
          rightElement={
            loading && <Spinner intent={Intent.PRIMARY} small={true} />
          }
          onChange={handleInputChange}
        />
        <Button
          text="Clear"
          style={{ marginLeft: '10px' }}
          onClick={handleClear}
        />
      </div>
      {error && (
        <Feedback intent={Intent.DANGER} title="Error">
          {error}
        </Feedback>
      )}
      {results && (
        <Feedback intent={Intent.SUCCESS} title="Results">
          <ResultsWrapper>{renderResults()}</ResultsWrapper>
        </Feedback>
      )}
    </div>
  )
}

const ResultsWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export default Sparqler
