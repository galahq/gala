/**
 * @providesModule CatalogToolbar
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
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
          message: 'catalog.catalog',
          iconName: 'home',
          onClick: () => history.push('/'),
        },
        {
          message: 'catalog.proposeACase',
          iconName: 'annotation',
          onClick: () =>
            (window.location = 'http://www.teachmsc.org/action/make'),
        },
        {
          message: 'deployments.index.deployACase',
          iconName: 'follower',
          onClick: () => (window.location = '/deployments'),
        },
      ],
      [],
      [{ component: <Search /> }],
    ]}
  />
)

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
      <FormCoveringToolbarOnMobile
        active={this.state.active}
        onSubmit={this.handleSubmit}
      >
        <InputGroup
          inputRef={el => (this.input = el)}
          className="pt-round"
          leftIconName="search"
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
