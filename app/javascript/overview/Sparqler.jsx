/**
 * @providesModule Sparqler
 * @flow
 */

import * as React from "react"
import { useState } from "react"
import { InputGroup, Button, Intent, Callout, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'

import { Orchard } from 'shared/orchard'

const SCHEMAS = {
  researchers: 'Researchers',
  software: 'Software',
  hardware: 'Hardware',
  grants: 'Grants',
  works: 'Works',
}

const Sparqler = (props) => {
  const [qId, setQId] = useState('')
  const [schema, setSchema] = useState(Object.keys(SCHEMAS)[0])
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [inputIntent, setInputIntent] = useState(Intent.NONE)

  const handleInputChange = (event) => {
    setQId(event.target.value)
  }

  const handleSchemaChange = (newSchema) => {
    setSchema(newSchema)
  }

  const handleBlur = () => {
    if (isValidQId(qId)) {
      makeQuery(qId, schema)
    }
  }

  const isValidQId = (id) => {
    if (!id.startsWith('Q')) {
      return false
    } else {
      return true
    }
  }

  const makeQuery = (id, schema) => {
    Orchard.harvest(`sparql/${schema}/${id.trim()}`)
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

  const handleClear = () => {
    setQId('')
    setResults(null)
    setError(null)
    setInputIntent(Intent.NONE)
  }

  React.useEffect(() => {
    if (qId.trim() === '') {
      return
    }
    if (!isValidQId(qId)) {
      setError("Invalid Q ID")
      setResults(null)
      setInputIntent(Intent.DANGER)
      return
    }
    makeQuery(qId, schema)
  }, [qId, schema])

  const renderSchemaItem = (schema, { handleClick, modifiers }) => (
    <MenuItem
      key={schema}
      text={SCHEMAS[schema]}
      active={modifiers.active}
      onClick={handleClick}
    />
  )

  return (
    <div>
      <h2 className="pt-dark">Wikidata</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Select
          items={Object.keys(SCHEMAS)}
          itemRenderer={renderSchemaItem}
          filterable={false}
          onItemSelect={handleSchemaChange}
        >
          <Button text={SCHEMAS[schema]} rightIcon="caret-down" />
        </Select>
        <InputGroup
          placeholder="Enter Q ID"
          value={qId}
          intent={inputIntent}
          style={{ marginLeft: '10px' }}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        <Button
          text="Clear"
          intent={Intent.NONE}
          style={{ marginLeft: '10px' }}
          onClick={handleClear}
        />
      </div>
      {error && <Callout intent={Intent.DANGER} title="Error">{error}</Callout>}
      {results && (
        <Callout intent={Intent.SUCCESS} title="Results">
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </Callout>
      )}
    </div>
  )
}

export default Sparqler
