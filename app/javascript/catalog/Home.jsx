/**
 * @providesModule Home
 * @flow
 */

import * as React from 'react'
import { values, omit } from 'ramda'

import DocumentTitle from 'react-document-title'

import ValueProposition from 'catalog/ValueProposition'
import Sidebar from 'catalog/Sidebar'
import Features from 'catalog/Features'
import Categories from 'catalog/Categories'
import Keywords from 'catalog/Keywords'
import { Main } from 'catalog/shared'
import Libraries from 'catalog/Libraries'
import asyncComponent from 'utility/asyncComponent'

import type { Case, Enrollment, Library, Reader, Tag } from 'redux/state'
import type { Loading } from 'catalog'

const MapView = asyncComponent(() =>
  import('catalog/MapView').then(m => m.default)
)

class Home extends React.Component<{
  loading: Loading,
  reader: ?Reader,
  cases: { [string]: Case },
  enrollments: Enrollment[],
  features: string[],
  tags: Tag[],
  readerIsEditor: boolean,
  onDeleteEnrollment: (
    slug: string,
    options: { displayBetaWarning?: boolean }
  ) => any,
  libraries: Library[],
}> {
  render () {
    const {
      loading,
      reader,
      onDeleteEnrollment,
      readerIsEditor,
      cases,
      tags,
      libraries,
    } = this.props
    return (
      <DocumentTitle title="Gala">
        <>
          {loading.reader || !!reader || <ValueProposition />}

          <Sidebar
            loading={loading}
            reader={reader}
            enrolledCases={this._enrolledCases()}
            onDeleteEnrollment={onDeleteEnrollment}
          />

          <Main>
            <Features
              readerIsEditor={readerIsEditor}
              featuredCases={this._featuredCases()}
            />

            {loading.cases || (
              <MapView
                cases={values(cases).filter(x => !!x.publishedAt)}
                title={{ id: 'cases.index.locations' }}
                startingViewport={{
                  latitude: 17.770231041567445,
                  longitude: 16.286555860170893,
                  zoom: 1.1606345336768273,
                }}
              />
            )}

            {tags &&
              tags.length > 0 && (
                <>
                  <Categories tags={tags} />
                  <Keywords tags={tags} />
                </>
            )}

            <Libraries libraries={libraries} />
          </Main>
        </>
      </DocumentTitle>
    )
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
