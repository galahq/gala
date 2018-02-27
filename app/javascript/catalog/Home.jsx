/**
 * @providesModule Home
 * @flow
 */

import * as React from 'react'
import { values, omit } from 'ramda'

import { FormattedMessage } from 'react-intl'

import Sidebar from 'catalog/Sidebar'
import Features from 'catalog/Features'
import MapView from 'catalog/MapView'
import CaseList from 'catalog/CaseList'
import { Main, CatalogSection, SectionTitle } from 'catalog/shared'

import type { Case, Enrollment, Reader } from 'redux/state'
import type { Loading } from 'catalog'

class Home extends React.Component<{
  loading: Loading,
  reader: ?Reader,
  cases: { [string]: Case },
  enrollments: Enrollment[],
  features: string[],
  readerIsEditor: boolean,
  onDeleteEnrollment: (
    slug: string,
    options: { displayBetaWarning?: boolean }
  ) => any,
}> {
  render () {
    const {
      loading,
      reader,
      onDeleteEnrollment,
      readerIsEditor,
      cases,
    } = this.props
    return [
      <Sidebar
        key="sidebar"
        loading={loading}
        reader={reader}
        enrolledCases={this._enrolledCases()}
        onDeleteEnrollment={onDeleteEnrollment}
      />,
      <Main key="main">
        <Features
          readerIsEditor={readerIsEditor}
          featuredCases={this._featuredCases()}
        />
        <MapView
          cases={values(cases).filter(x => !!x.publishedAt)}
          title={{ id: 'cases.index.locations' }}
          startingViewport={{
            latitude: 17.770231041567445,
            longitude: 16.286555860170893,
            zoom: 1.1606345336768273,
          }}
        />
        <CatalogSection>
          <SectionTitle>
            <FormattedMessage id="cases.index.allCases" />
          </SectionTitle>
          <CaseList
            readerIsEditor={readerIsEditor}
            cases={this._allOtherCases()}
          />
        </CatalogSection>
      </Main>,
    ]
  }

  _enrolledCases = () =>
    this.props.enrollments
      .map(e => this.props.cases[e.caseSlug])
      .filter(x => !!x)

  _featuredCases = () =>
    this.props.features.map(slug => this.props.cases[slug]).filter(x => !!x)

  _allOtherCases = () =>
    values(
      omit(
        this.props.enrollments.map(e => e.caseSlug).concat(this.props.features),
        this.props.cases
      )
    )
      .filter(x => !!x.kicker)
      .sort((a, b) => a.kicker.localeCompare(b.kicker))
}
export default Home
