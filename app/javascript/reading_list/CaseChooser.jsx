/**
 * @providesModule CaseChooser
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { Button, InputGroup } from '@blueprintjs/core'

import { Element } from 'catalog/shared'
import { Orchard } from 'shared/orchard'

import type { Case, Enrollment } from 'redux/state'

type Props = {
  cases: { string: Case },
  onSelect: string => void,
}

function CaseChooser ({ cases, onSelect }: Props) {
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])

  React.useEffect(() => {
    Orchard.harvest('enrollments').then(enrollments =>
      setEnrollments(enrollments)
    )
  }, [])

  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<string[]>([])

  const choosableCases = query
    ? results.map(slug => cases[slug])
    : enrollments.map(enrollment => cases[enrollment.caseSlug])

  return (
    <>
      <Heading>Add a Case</Heading>
      <div className="pt-card">
        <form onSubmit={handleSearch}>
          <InputGroup
            className="pt-round"
            leftIcon="search"
            name="q"
            rightElement={
              <button
                className="pt-button pt-minimal pt-icon-arrow-right"
                type="submit"
              />
            }
            placeholder="Search"
          />
        </form>

        <Subheading>{query ? 'Search Results' : 'Enrolled Cases'}</Subheading>

        {choosableCases.map(caseData => {
          if (caseData == null) return null

          return (
            <Element
              key={caseData.slug}
              image={caseData.smallCoverUrl}
              text={caseData.kicker}
              rightElement={
                <Button
                  minimal
                  icon="plus"
                  onClick={() => onSelect(caseData.slug)}
                >
                  Add
                </Button>
              }
            />
          )
        })}
      </div>
    </>
  )

  async function handleSearch (e) {
    e.preventDefault()
    const q = (e.target: any).elements['q'].value

    setQuery(q)
    setResults([])

    const newResults = await Orchard.harvest('search', { q })

    setResults(newResults)
  }
}

export default CaseChooser

const Heading = styled.h2`
  font-size: 20px;
`

const Subheading = styled.h3`
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 16px;
`
