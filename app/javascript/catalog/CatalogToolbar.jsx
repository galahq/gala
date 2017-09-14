/**
 * @providesModule CatalogToolbar
 * @flow
 */

import React from 'react'

import Toolbar from 'utility/Toolbar'

const CatalogToolbar = () => (
  <Toolbar
    groups={[
      [
        {
          message: 'catalog',
          iconName: 'home',
          onClick: () => (window.location = '/'),
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

export default CatalogToolbar
