/**
 * @providesModule CaseChooser
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { Button, InputGroup } from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Element } from 'catalog/shared'
import { Orchard } from 'shared/orchard'

import type { IntlShape } from 'react-intl'
import type { Case, Enrollment } from 'redux/state'

type Props = {
  cases: { string: Case },
  intl: IntlShape,
  onSelect: string => void,
}

function CaseChooser ({ cases, intl, onSelect }: Props) {
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])

  React.useEffect(() => {
    Orchard.harvest('enrollments').then(enrollments =>
      setEnrollments(enrollments)
    )
  }, [])

  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<string[]>([])

  const choosableCases = query
    ? results.map(slug => cases[slug]).filter(Boolean)
    : enrollments.map(enrollment => cases[enrollment.caseSlug]).filter(Boolean)

  return (
    <>
      <Container>
        <Heading>
          <FormattedMessage id="readingListItems.new.addCase" />
        </Heading>

        <form onSubmit={handleSearch}>
          <InputGroup
            className="pt-round"
            leftIcon="search"
            name="q"
            role="search"
            aria-label={intl.formatMessage({
              id: 'readingListItems.new.searchForACaseToAdd',
            })}
            rightElement={
              <button
                className="pt-button pt-minimal pt-icon-arrow-right"
                type="submit"
                aria-label={intl.formatMessage({
              id: 'search.submitSearch',
            })}
              />
            }
            placeholder={intl.formatMessage({
              id: 'readingListItems.new.searchForACaseToAdd',
            })}
          />
        </form>

        <Subheading>
          {query ? (
            <FormattedMessage id="search.results" />
          ) : (
            choosableCases.length > 0 && (
              <FormattedMessage id="enrollments.index.enrolledCases" />
            )
          )}
        </Subheading>

        {choosableCases.map(caseData => {
          return (
            <Element
              key={caseData.slug}
              image={caseData.smallCoverUrl}
              text={caseData.kicker}
              rightElement={
                <Button
                  minimal
                  aria-label={intl.formatMessage(
                    {
                      id: 'readingListItems.new.addThisCase',
                    },
                    { case: caseData.kicker }
                  )}
                  icon="plus"
                  onClick={() => onSelect(caseData.slug)}
                >
                  <FormattedMessage id="helpers.add" />
                </Button>
              }
            />
          )
        })}
      </Container>
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

export default injectIntl(CaseChooser)

const Container = styled.div.attrs({ className: 'pt-card' })`
  &:not(:first-child) {
    margin-top: 64px;
  }
`

const Heading = styled.h2`
  font-size: 20px;
`

const Subheading = styled.h3`
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 16px;
  text-transform: capitalize;
`
