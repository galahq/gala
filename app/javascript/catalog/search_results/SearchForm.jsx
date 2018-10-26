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

import type { IntlShape } from 'react-intl'
import type { ContextRouter } from 'react-router-dom'
import type { Query } from 'catalog/search_results'
import type { Tag } from 'redux/state'

type Props = {| ...ContextRouter, params: Query, intl: IntlShape |}
type State = { q: string, libraries: string[], tags: Tag[] }
class SearchForm extends React.Component<Props, State> {
  state = {
    q: (this.props.params.q || []).join(' '),
    libraries: this.props.params.libraries,
    tags: makeDummyTags(this.props.params.tags),
  }

  get stateForSearchParams () {
    const { q, libraries, tags } = this.state
    return { q, libraries, tags: tags.map(tag => tag.name) }
  }

  componentDidUpdate (prevProps: Props) {
    if (
      this.props.params.q === prevProps.params.q &&
      this.props.params.libraries === prevProps.params.libraries
    ) {
      return
    }

    this.setState({
      q: (this.props.params.q || []).join(' '),
      libraries: this.props.params.libraries,
    })
  }

  handleChangeQuery = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.setState({ q: e.currentTarget.value })

  handleChangeTags = (tags: Tag[]) => this.setState({ tags })

  handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.props.history.push(getSearchPath(this.stateForSearchParams))
  }

  render () {
    const { q, tags } = this.state
    return (
      <CatalogSection className="pt-dark">
        <SectionTitle>
          <FormattedMessage id="search.refine" />
        </SectionTitle>

        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <InputGroup
              className="pt-fill"
              leftIcon="search"
              placeholder={this.props.intl.formatMessage({
                id: 'search.fullTextSearch',
              })}
              value={q}
              onChange={this.handleChangeQuery}
            />
          </FormGroup>

          <FormGroup label={<FormattedMessage id="catalog.keywords" />}>
            <KeywordsChooser tags={tags} onChange={this.handleChangeTags} />
          </FormGroup>

          <SubmitButton>
            <FormattedMessage id="search.search" />
          </SubmitButton>
        </form>
      </CatalogSection>
    )
  }
}
export default injectIntl(withRouter(SearchForm))

function makeDummyTags (names: ?(string[])) {
  return names ? names.map(name => ({ name, displayName: name })) : []
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
