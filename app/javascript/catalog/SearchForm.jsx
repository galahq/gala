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

import { InputGroup, Button, Intent } from '@blueprintjs/core'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { IntlShape } from 'react-intl'
import type { ContextRouter } from 'react-router-dom'
import type { Query } from 'catalog/Results'

type Props = {| ...ContextRouter, params: Query, intl: IntlShape |}
type State = { q: string, libraries: string[] }
class SearchForm extends React.Component<Props, State> {
  state = {
    q: (this.props.params.q || []).join(' '),
    libraries: this.props.params.libraries,
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

  handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.props.history.push(getSearchPath(this.state))
  }

  render () {
    const { q } = this.state
    return (
      <CatalogSection className="pt-dark">
        <SectionTitle>
          <FormattedMessage id="search.refine" defaultMessage="Refine search" />
        </SectionTitle>
        <form onSubmit={this.handleSubmit}>
          <InputGroup
            className="pt-fill"
            leftIconName="search"
            placeholder={this.props.intl.formatMessage({
              id: 'search.keywordQuery',
              defaultMessage: 'Keyword query',
            })}
            value={q}
            onChange={this.handleChangeQuery}
          />
          <SubmitButton>
            <FormattedMessage id="search.search" defaultMessage="Search" />
          </SubmitButton>
        </form>
      </CatalogSection>
    )
  }
}
export default injectIntl(withRouter(SearchForm))

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
