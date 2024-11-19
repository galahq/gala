/* @flow */
import React, { useState, useEffect } from "react"
import { InputGroup, Button, Intent, Callout, MenuItem } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import { Orchard } from "shared/orchard"

const SCHEMAS = {
  researchers: "Researchers",
  software: "Software",
  hardware: "Hardware",
  grants: "Grants",
  works: "Works",
}

const Sparqler = () => {
  const [state, setState] = useState({
    qId: "",
    schema: Object.keys(SCHEMAS)[0],
    results: null,
    error: null,
    inputIntent: Intent.NONE,
  })

  const { qId, schema, results, error, inputIntent } = state

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }))

  const isValidQId = (id) => id.trim().startsWith("Q")

  const makeQuery = (id, schema) => {
    Orchard.harvest(`sparql/${schema}/${id.trim()}`)
      .then((resp) => {
        if (Array.isArray(resp) && resp.length === 0) {
          updateState({ error: "No results found", results: null, inputIntent: Intent.DANGER })
        } else {
          updateState({ results: resp, error: null, inputIntent: Intent.SUCCESS })
        }
      })
      .catch((err) => {
        updateState({ error: err.message, results: null, inputIntent: Intent.DANGER })
      })
  }

  const handleInputChange = (e) => updateState({ qId: e.target.value })
  const handleSchemaChange = (newSchema) => updateState({ schema: newSchema })
  const handleClear = () => updateState({ qId: "", results: null, error: null, inputIntent: Intent.NONE })

  useEffect(() => {
    if (qId.trim() && isValidQId(qId)) {
      makeQuery(qId, schema)
    } else if (qId.trim() && !isValidQId(qId)) {
      updateState({ error: "Invalid Q ID", results: null, inputIntent: Intent.DANGER })
    }
  }, [qId, schema])

  const renderSchemaItem = (schema, { handleClick, modifiers }) => (
    <MenuItem key={schema} text={SCHEMAS[schema]} active={modifiers.active} onClick={handleClick} />
  )

  const Feedback = ({ intent, title, children }) => (
    <Callout intent={intent} title={title}>
      {children}
    </Callout>
  )

  return (
    <div>
      <h2 className="pt-dark">Wikidata</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
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
          style={{ marginLeft: "10px" }}
          onChange={handleInputChange}
        />
        <Button text="Clear" style={{ marginLeft: "10px" }} onClick={handleClear} />
      </div>
      {error && <Feedback intent={Intent.DANGER} title="Error">{error}</Feedback>}
      {results && <Feedback intent={Intent.SUCCESS} title="Results"><pre>{JSON.stringify(results, null, 2)}</pre></Feedback>}
    </div>
  )
}

export default Sparqler
