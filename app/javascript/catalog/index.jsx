/**
 * @providesModule Catalog
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'
import { values, omit } from 'ramda'
import { injectIntl } from 'react-intl'

import { Orchard } from 'shared/orchard'

import CatalogToolbar from 'catalog/CatalogToolbar'
import Sidebar from 'catalog/Sidebar'
import Features from 'catalog/Features'
import CaseList from 'catalog/CaseList'
import { MaxWidthContainer } from 'utility/styledComponents'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Case, Enrollment, Reader } from 'redux/state'

export type Loading = { reader: boolean, cases: boolean }

class Catalog extends Component {
  props: { intl: any }
  state = {
    loading: { reader: true, cases: true },

    reader: (null: ?Reader),
    cases: ({}: { [string]: Case }),
    enrollments: ([]: Enrollment[]),
    features: ([]: string[]),
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
      <div style={{ minHeight: '100%' }}>
        <CatalogToolbar />
        <MaxWidthContainer>
          <Window>
            <Sidebar
              loading={this.state.loading}
              reader={this.state.reader}
              enrolledCases={this._enrolledCases()}
              onDeleteEnrollment={this.handleDeleteEnrollment}
            />
            <Main>
              <Features
                readerIsEditor={this._readerIsEditor()}
                featuredCases={this._featuredCases()}
              />
              <CatalogSection>
                <SectionTitle>All cases</SectionTitle>
                <CaseList
                  readerIsEditor={this._readerIsEditor()}
                  cases={this._allOtherCases()}
                />
              </CatalogSection>
            </Main>
          </Window>
        </MaxWidthContainer>
      </div>
    )
  }

  _readerIsEditor = () => {
    const { reader } = this.state
    return !!reader && !!reader.roles && reader.roles.editor
  }

  _enrolledCases = () =>
    this.state.enrollments
      .map(e => this.state.cases[e.caseSlug])
      .filter(x => !!x)

  _featuredCases = () =>
    this.state.features.map(slug => this.state.cases[slug]).filter(x => !!x)

  _allOtherCases = () =>
    values(
      omit(
        this.state.enrollments.map(e => e.caseSlug).concat(this.state.features),
        this.state.cases
      )
    ).sort((a, b) => a.kicker.localeCompare(b.kicker))
}

export default injectIntl(Catalog)

const Window = styled.div`
  min-height: 100%;
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  padding: 2em 1em;
  margin: 0 -0.5em;
`
const Main = styled.main`
  flex: 1;
  margin: 0 0.5em;

  & ${CatalogSection}:not(:first-child) {
    margin-top: 22px;
  }
`
