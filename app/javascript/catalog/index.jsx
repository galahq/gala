/**
 * @providesModule Catalog
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import ErrorBoundary from 'utility/ErrorBoundary'
import {
  Provider as ContentItemSelectionContextProvider,
  Consumer as ContentItemSelectionContextConsumer,
} from 'deployment/contentItemSelectionContext'
import {
  NaturalResourcesGrid,
  GlobalSystemsGrid,
} from 'catalog/home/Categories'
import { CatalogDataContextProvider } from 'catalog/catalogData'
import { ReaderDataContextProvider } from 'catalog/readerData'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import CatalogToolbar from 'catalog/CatalogToolbar'
import { MaxWidthContainer } from 'utility/styledComponents'
import Home from 'catalog/home'
import Results from 'catalog/search_results'

import type { IntlShape } from 'react-intl'

export function Catalog({ intl }: { intl: IntlShape }) {
  const basename = window.location.pathname.match(/^(\/\w{2}(-\w{2})?)?\//)[0]

  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <CatalogDataContextProvider>
          <ReaderDataContextProvider>
            <ContentItemSelectionContextProvider>
              <Container>
                <CatalogToolbar />

                <MaxWidthContainer>
                  <Switch>
                    <Route
                      exact
                      path="/"
                      render={() => (
                        <ConnectedWindow>
                          <Home />
                        </ConnectedWindow>
                      )}
                    />

                    <Route
                      path="/catalog/"
                      render={props => (
                        <Window>
                          <Results {...props} />
                        </Window>
                      )}
                    />
                  </Switch>
                </MaxWidthContainer>
              </Container>
            </ContentItemSelectionContextProvider>
          </ReaderDataContextProvider>
        </CatalogDataContextProvider>
      </Router>
    </ErrorBoundary>
  )
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
    'sidebar banner' minmax(0, auto)
    'sidebar welcome-message' minmax(0, auto)
    'sidebar value-proposition' minmax(0, auto)
    'sidebar main' min-content / 19em calc(100% - 19em - 1em);
  min-height: 100%;
  position: relative;
  padding: 2em 1em;
  margin: 0;

  @media (max-width: 1100px) {
    grid-template:
      'sidebar banner' minmax(0, auto)
      'sidebar welcome-message' minmax(0, auto)
      'sidebar value-proposition' minmax(0, auto)
      'sidebar main' min-content / 15em calc(100% - 15em - 1em);
  }

  @media (max-width: 700px) {
    grid-template: 'banner' 'welcome-message' 'value-proposition' 'sidebar' 'main' auto / 100%;

    & .devise-card {
      margin: auto;
    }
  }
`

const ContentItemSelectionInProgressWindow = styled(Window)`
  grid-template:
    'banner'
    'welcome-message'
    'value-proposition'
    'main' min-content / 100%;

  @media (max-width: 1100px) {
    grid-template:
      'banner'
      'welcome-message'
      'value-proposition'  
      'main' min-content / 100%;
  }

  @media (max-width: 700px) {
    grid-template: 'banner' 'welcome-message' 'value-proposition' 'main' auto / 100%;
  }

  & ${NaturalResourcesGrid}, & ${GlobalSystemsGrid} {
    flex-direction: row;

    & > *:not(:last-child) {
      margin-right: 1em !important;
      margin-bottom: 0 !important;
    }
  }
`

const ConnectedWindow = ({ children }) => (
  <ContentItemSelectionContextConsumer>
    {({ selecting }) => {
      const Container = selecting
        ? ContentItemSelectionInProgressWindow
        : Window
      return <Container>{children}</Container>
    }}
  </ContentItemSelectionContextConsumer>
)
