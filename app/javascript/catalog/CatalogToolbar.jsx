/**
 * @providesModule CatalogToolbar
 * @flow
 */

import React from 'react'

import { withRouter } from 'react-router-dom'

import Toolbar from 'utility/Toolbar'

import type { ContextRouter } from 'react-router-dom'

const CatalogToolbar = ({ history }: ContextRouter) => (
  <Toolbar
    groups={[
      [
        {
          message: 'catalog',
          iconName: 'home',
          onClick: () => history.push('/'),
        },
        {
          message: 'catalog.proposeACase',
          iconName: 'annotation',
          onClick: () =>
            (window.location = 'http://www.teachmsc.org/action/make'),
        },
      ],
      [],
      [],
    ]}
  />
)

export default withRouter(CatalogToolbar)
