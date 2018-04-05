/**
 * @providesModule Catalog
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import { Orchard } from 'shared/orchard'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import CatalogToolbar from 'catalog/CatalogToolbar'
import { MaxWidthContainer } from 'utility/styledComponents'
import Home from 'catalog/Home'
import Results from 'catalog/Results'

import type { IntlShape } from 'react-intl'
import type { Case, Enrollment, Reader } from 'redux/state'

export type Loading = { reader: boolean, cases: boolean }

export type State = {|
  loading: Loading,
  reader: ?Reader,
  cases: { [string]: Case },
  enrollments: Enrollment[],
  features: string[],
|}

export class Catalog extends React.Component<{ intl: IntlShape }, State> {
  state = {
    loading: { reader: true, cases: true },
    reader: null,
    cases: {},
    enrollments: [],
    features: [],
  }

  handleDeleteEnrollment = (
    slug: string,
    options: { displayBetaWarning?: boolean } = {}
  ) => {
    const { intl } = this.props
    if (
      !window.confirm(
        `${intl.formatMessage({ id: 'enrollments.destroy.areYouSure' })}${
          options.displayBetaWarning
            ? `\n\n${intl.formatMessage({
              id: 'enrollments.destroy.youWillNeedAnotherInvitation',
            })}`
            : ''
        }`
      )
    ) {
      return
    }

    Orchard.prune(`cases/${slug}/enrollment`).then(() =>
      this.setState({
        enrollments: this.state.enrollments.filter(e => e.caseSlug !== slug),
      })
    )
  }

  componentDidMount () {
    Orchard.harvest('profile')
      .then(reader => this.setState({ reader }))
      .catch(e => e.name === 'OrchardError' && this.setState({ reader: null }))
      .then(() =>
        this.setState(({ loading }) => ({
          loading: { ...loading, reader: false },
        }))
      )
    Orchard.harvest('cases').then(cases =>
      this.setState(({ loading }) => ({
        cases,
        loading: { ...loading, cases: false },
      }))
    )
    Orchard.harvest('cases/features').then(({ features }) =>
      this.setState({ features })
    )
    Orchard.harvest('enrollments').then(enrollments =>
      this.setState({ enrollments })
    )
  }

  render () {
    const basename = window.location.pathname.match(/^(\/\w{2}(-\w{2})?)?\//)[0]
    return (
      <Router basename={basename}>
        <Container>
          <CatalogToolbar />
          <MaxWidthContainer>
            <Window>
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => (
                    <Home
                      readerIsEditor={this._readerIsEditor()}
                      {...this.state}
                      onDeleteEnrollment={this.handleDeleteEnrollment}
                    />
                  )}
                />
                <Route
                  path="/catalog/"
                  render={props => (
                    <Results
                      readerIsEditor={this._readerIsEditor()}
                      {...this.state}
                      {...props}
                    />
                  )}
                />
              </Switch>
            </Window>
          </MaxWidthContainer>
        </Container>
      </Router>
    )
  }

  _readerIsEditor = () => {
    const { reader } = this.state
    return !!reader && !!reader.roles && reader.roles.editor
  }
}

export default injectIntl(Catalog)

const Container = styled.div`
  min-height: 100%;
  width: 100vw;
  overflow: hidden;
`
const Window = styled.div`
  display: grid;
  grid-gap: 0 1rem;
  grid-template:
    'sidebar value-proposition'
    'sidebar banner'
    'sidebar main' auto / 19em calc(100% - 19em - 1em);
  min-height: 100%;
  position: relative;
  padding: 2em 1em;
  margin: 0;

  @media (max-width: 700px) {
    grid-template: 'value-proposition' 'sidebar' 'banner' 'main' auto / 100%;
`
