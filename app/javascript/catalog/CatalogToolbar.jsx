/**
 * @providesModule CatalogToolbar
 * @flow
 */

import * as React from 'react'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'

import { InputGroup } from '@blueprintjs/core'

import Toolbar from 'utility/Toolbar'
import { getSearchPath } from 'catalog/SearchForm'

import type { IntlShape } from 'react-intl'
import type { ContextRouter } from 'react-router-dom'

const CatalogToolbar = ({ history }: ContextRouter) => (
  <Toolbar
    groups={[
      [
        {
          message: 'catalog',
          iconName: 'home',
          onClick: () => history.push('/'),
        },
        {
          message: 'catalog.proposeACase',
          iconName: 'annotation',
          onClick: () =>
            (window.location = 'http://www.teachmsc.org/action/make'),
        },
      ],
      [],
      [{ component: <Search /> }],
    ]}
  />
)

export default withRouter(CatalogToolbar)

class SearchField extends React.Component<ContextRouter & { intl: IntlShape }> {
  input: ?HTMLInputElement

  handleSubmit = (e: SyntheticEvent<*>) => {
    e.preventDefault()
    this.input &&
      this.props.history.push(
        getSearchPath({
          q: this.input.value,
        })
      )
    this.input && this.input.blur()
    this.input && (this.input.value = '')
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <InputGroup
          inputRef={el => (this.input = el)}
          className="pt-round"
          leftIconName="search"
          rightElement={
            <button
              className="pt-button pt-minimal pt-intent-success pt-icon-arrow-right"
              onClick={this.handleSubmit}
            />
          }
          placeholder={this.props.intl.formatMessage({
            id: 'catalog.search',
            defaultMessage: 'Search cases',
          })}
        />
      </form>
    )
  }
}

const Search = withRouter(injectIntl(SearchField))
