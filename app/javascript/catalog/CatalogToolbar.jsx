/**
 * @providesModule CatalogToolbar
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'

import { InputGroup } from '@blueprintjs/core'

import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'
import Toolbar from 'utility/Toolbar'
import { getSearchPath } from 'catalog/search_results/SearchForm'
import TranslatedSpotlight from 'shared/spotlight/TranslatedSpotlight'
import { ReaderDataContext } from 'catalog/readerData'

import type { IntlShape } from 'react-intl'
import type { ContextRouter } from 'react-router-dom'

type Props = {| ...ContextRouter |}

const CatalogToolbar = ({ history }: Props) => {
  const {
    roles: { author, instructor },
  } = React.useContext(ReaderDataContext)

  return (
    <ContentItemSelectionContextConsumer>
      {({ selecting }) => (
        <Toolbar
          groups={[
            [
              {
                message: 'catalog.catalog',
                icon: 'home',
                onClick: () => history.push('/'),
              },

              selecting || {
                message: author
                  ? 'myCases.index.myCases'
                  : 'cases.new.createACase',
                icon: 'annotation',
                onClick: () => (window.location = '/my_modules'),
                spotlightKey: 'my_modules',
              },

              selecting || {
                message: instructor
                  ? 'deployments.index.myDeployments'
                  : 'deployments.index.deployACase',
                icon: 'follower',
                onClick: () => (window.location = '/deployments'),
              },
            ],

            [],

            [{ component: <Search /> }],
          ]}
        />
      )}
    </ContentItemSelectionContextConsumer>
  )
}

// $FlowFixMe
export default withRouter(CatalogToolbar)

class SearchField extends React.Component<
  ContextRouter & { intl: IntlShape },
  { active: boolean }
> {
  state = { active: false }
  input: ?HTMLInputElement

  handleSubmit = (e: SyntheticEvent<*>) => {
    e.preventDefault()
    if (!this.input || this.input.value === '') return

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
      <TranslatedSpotlight spotlightKey="catalog_search">
        {({ ref }) => (
          <FormCoveringToolbarOnMobile
            active={this.state.active}
            onSubmit={this.handleSubmit}
            ref={ref}
          >
            <InputGroup
              inputRef={el => (this.input = el)}
              className="pt-round"
              leftIcon="search"
              rightElement={
                <button
                  className="pt-button pt-minimal pt-icon-arrow-right"
                  onClick={this.handleSubmit}
                />
              }
              placeholder={this.props.intl.formatMessage({
                id: 'search.searchCases',
              })}
              onFocus={() => this.setState({ active: true })}
              onBlur={() => this.setState({ active: false })}
            />
          </FormCoveringToolbarOnMobile>
        )}
      </TranslatedSpotlight>
    )
  }
}

const Search = withRouter(injectIntl(SearchField))

const FormCoveringToolbarOnMobile = styled.form`
  @media screen and (max-width: 513px) {
    background-color: #1d3f5e;
    margin-left: -24px;
    ${({ active }) =>
      active
        ? css`
            margin-left: 0px;
            position: absolute;
            left: 14px;
            width: calc(100vw - 28px);
          `
        : ''};
  }
`
