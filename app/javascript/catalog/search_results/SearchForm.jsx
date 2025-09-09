/**
 * @providesModule SearchForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import qs from 'qs'
import { reject, isEmpty } from 'ramda'

import { withRouter } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

import { Button, FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import { CatalogSection, SectionTitle } from 'catalog/shared'
import KeywordsChooser from 'overview/keywords/KeywordsChooser'
import LanguageChooser from './LanguageChooser'

import type { IntlShape } from 'react-intl'
import type { ContextRouter } from 'react-router-dom'
import type { Query } from 'catalog/search_results/getQueryParams'
import type { Tag } from 'redux/state'

type Language = { code: string, name: string }

type Props = {| ...ContextRouter, params: Query, intl: IntlShape |}
function SearchForm ({ history, intl, params }: Props) {
  const queryFromUrl = (params.q || []).join(' ')
  const [query, setQuery] = React.useState(queryFromUrl)
  React.useEffect(() => setQuery(queryFromUrl), [params.query])

  const [tagObjects, setTagObjects] = React.useState(
    createTagObjects(params.tags)
  )

  const [languageObjects, setLanguageObjects] = React.useState(
    createLanguageObjects(params.languages)
  )

  function handleSubmit (e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const searchPath = getSearchPath({
      q: query,
      libraries: params.libraries,
      tags: tagObjects.map(tag => tag.name),
      languages: languageObjects.map(lang => lang.code),
    })
    history.push(searchPath)
  }

  return (
    <CatalogSection className="pt-dark">
      <SectionTitle>
        <FormattedMessage id="search.refine" />
      </SectionTitle>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <InputGroup
            className="pt-fill"
            leftIcon="search"
            placeholder={intl.formatMessage({
              id: 'search.fullTextSearch',
            })}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </FormGroup>

        <FormGroup label={<FormattedMessage id="catalog.keywords" />}>
          <KeywordsChooser tags={tagObjects} onChange={setTagObjects} />
        </FormGroup>

        <FormGroup label={<FormattedMessage id="catalog.languages.Languages" />}>
          <LanguageChooser languages={languageObjects} onChange={setLanguageObjects} />
        </FormGroup>

        <SubmitButton>
          <FormattedMessage id="search.search" />
        </SubmitButton>
      </form>
    </CatalogSection>
  )
}

export default injectIntl(withRouter(SearchForm))

function createTagObjects (names: ?(string[])): Tag[] {
  return names ? names.map(name => ({ name, displayName: name })) : []
}

function createLanguageObjects (codes: ?(string[])): Language[] {
  return codes ? codes.map(code => ({ code, name: code })) : []
}

export function getSearchPath (params: Object): string {
  return `/catalog/search?${qs.stringify(reject(isEmpty, params), {
    arrayFormat: 'brackets',
    encodeValuesOnly: true,
    encoder: value => encodeURIComponent(value).replace(/%20/g, '+'),
    skipNulls: true,
  })}`
}

const SubmitButton = styled(Button).attrs({
  type: 'submit',
  intent: Intent.SUCCESS,
})`
  margin-top: 12px;
`
