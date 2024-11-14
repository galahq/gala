/**
 * @providesModule Sparqler
 * @flow
 */

import * as React from "react"
import { useState } from "react"
import { InputGroup, Button, Intent, Callout } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'

const Sparqler = (props) => {
  const [qId, setQId] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [inputIntent, setInputIntent] = useState(Intent.NONE)

  const handleInputChange = (event) => {
    setQId(event.target.value)
  }

  const handleBlur = () => {
    if (isValidQId(qId)) {
      makeQuery(qId)
    }
  }

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
    makeQuery(qId)
  }, [qId])

  return (
    <div>
      <h2 className="pt-dark">Researcher</h2>
      <InputGroup
        placeholder="Enter Q ID"
        value={qId}
        intent={inputIntent}
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
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
