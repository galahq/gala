/**
 * @providesModule Catalog
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'
import { values, omit } from 'ramda'

import { Orchard } from 'shared/orchard'

import CatalogToolbar from 'catalog/CatalogToolbar'
import Sidebar from 'catalog/Sidebar'
import Features from 'catalog/Features'
import CaseList from 'catalog/CaseList'
import { MaxWidthContainer } from 'utility/styledComponents'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { Case, Enrollment, Reader } from 'redux/state'

class Catalog extends Component {
  state = {
    reader: ({ loading: true }: ?Reader | { loading: true }),
    cases: ({}: { [string]: Case }),
    enrollments: ([]: Enrollment[]),
    features: ([]: string[]),
  }

  handleDeleteEnrollment = (
    slug: string,
    options: { displayBetaWarning?: boolean } = {}
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to unenroll in this case?${options.displayBetaWarning
          ? '\n\nBecause this case is not published, you will need another invitation to reenroll.'
          : ''}`
      )
    ) {
      return
    }

    this.setState({
      enrollments: this.state.enrollments.filter(e => e.caseSlug !== slug),
    })
  }

  componentDidMount () {
    Orchard.harvest('profile')
      .then(reader => this.setState({ reader }))
      .catch(e => e.name === 'OrchardError' && this.setState({ reader: null }))
    Orchard.harvest('cases').then(cases => this.setState({ cases }))
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
              reader={this.state.reader}
              enrolledCases={this._enrolledCases()}
              onDeleteEnrollment={this.handleDeleteEnrollment}
            />
            <Main>
              <Features readerIsEditor featuredCases={this._featuredCases()} />
              <CatalogSection>
                <SectionTitle>All cases</SectionTitle>
                <CaseList readerIsEditor cases={this._allOtherCases()} />
              </CatalogSection>
            </Main>
          </Window>
        </MaxWidthContainer>
      </div>
    )
  }

  _enrolledCases = () =>
    this.state.enrollments.map(e => this.state.cases[e.caseSlug])

  _featuredCases = () => this.state.features.map(slug => this.state.cases[slug])

  _allOtherCases = () =>
    values(
      omit(
        this.state.enrollments.map(e => e.caseSlug).concat(this.state.features),
        this.state.cases
      )
    ).sort((a, b) => a.kicker.localeCompare(b.kicker))
}

export default Catalog

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
