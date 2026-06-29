/**
 * @providesModule SearchForm
 * 
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



function SearchForm ({ history, intl, params }) {
  const queryFromUrl = (params.q || []).join(' ')
  const [query, setQuery] = React.useState(queryFromUrl)
  React.useEffect(() => setQuery(queryFromUrl), [params.query])

  const [tagObjects, setTagObjects] = React.useState(
    createTagObjects(params.tags)
  )

  const [languageObjects, setLanguageObjects] = React.useState(
    createLanguageObjects(params.languages)
  )

  function handleSubmit (e) {
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
    <CatalogSection className="bp6-dark bp6-dark">
      <SectionTitle>
        <FormattedMessage id="search.refine" />
      </SectionTitle>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <InputGroup
            className="bp6-fill bp6-fill"
            aria-label={intl.formatMessage({
              id: 'search.fullTextSearch',
            })}
            role="search"
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

function createTagObjects (names) {
  return names ? names.map(name => ({ name, displayName: name })) : []
}

function createLanguageObjects (codes) {
  return codes ? codes.map(code => ({ code, name: code })) : []
}

export function getSearchPath (params) {
  return `/catalog/search?${qs.stringify(reject(isEmpty, params), {
    arrayFormat: 'brackets',
    encodeValuesOnly: true,
    encoder: value => encodeURIComponent(value).replace(/%20/g, '+'),
    skipNulls: true,
  })}`
}

const SubmitButton = styled(Button).attrs({
  className: 'bp6-button bp6-button bp6-intent-success bp6-intent-success',
  type: 'submit',
  intent: Intent.SUCCESS,
})`
  margin-top: 12px;
`
