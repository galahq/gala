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

class Catalog extends React.Component<{ intl: IntlShape }, State> {
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
        `${intl.formatMessage({
          id: 'catalog.unenrollConfirmation',
          defaultMessage: 'Are you sure you want to unenroll in this case?',
        })}${options.displayBetaWarning
          ? `\n\n${intl.formatMessage({
            id: 'catalog.unenrollBetaWarning',
            defaultMessage:
                'Because this case is not published, you will need another invitation to reenroll.',
          })}`
          : ''}`
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
    return (
      <Router>
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
  min-height: 100%;
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  padding: 2em 1em;
  margin: 0 -0.5em;
`
