/**
 * @providesModule Home
 * @flow
 */

import * as React from 'react'
import { values } from 'ramda'

import { CatalogDataContext } from 'catalog/catalogData'
import { ReaderDataContext } from 'catalog/readerData'
import ValueProposition from 'catalog/home/ValueProposition'
import Announcements from 'catalog/home/Announcements'
import Sidebar from 'catalog/home/Sidebar'
import Features from 'catalog/home/Features'
import Categories from 'catalog/home/Categories'
import Keywords from 'catalog/home/Keywords'
import { Main, CatalogSection } from 'catalog/shared'
import Libraries from 'catalog/home/Libraries'
import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'
import { useDocumentTitle } from 'utility/hooks'
import WelcomeMessage from 'catalog/home/WelcomeMessage'

// $FlowFixMe
const MapView = React.lazy(() => import('map_view'))

function Home() {
  const [{ cases, tags, loading: casesLoading }] = React.useContext(
    CatalogDataContext
  )

  const { reader, loading: readerLoading } = React.useContext(ReaderDataContext)

  useDocumentTitle('Gala')

  return (
    <ContentItemSelectionContextConsumer>
      {({ selecting }) => (
        <>
          <WelcomeMessage reader={reader} />
          {readerLoading || !!reader || selecting || <ValueProposition />}

          {selecting || <Sidebar />}

          <Announcements />

          <Main>
            <Features selecting={selecting} />

            <Libraries />
            {tags && tags.length > 0 && (
              <>
                <Keywords />
                <Categories />
              </>
            )}
            {casesLoading || (
              // $FlowFixMe
              <React.Suspense
                fallback={
                  <CatalogSection className="bp3-skeleton">
                    Loading...
                  </CatalogSection>
                }
              >
                <MapView
                  cases={values(cases).filter(x => !!x.publishedAt)}
                  title={{ id: 'cases.index.locations' }}
                  startingViewport={{
                    latitude: 17.770231041567445,
                    longitude: 16.286555860170893,
                    zoom: 1.1606345336768273,
                  }}
                />
              </React.Suspense>
            )}
          </Main>
        </>
      )}
    </ContentItemSelectionContextConsumer>
  )
}

export default Home
