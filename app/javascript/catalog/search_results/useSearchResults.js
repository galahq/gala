/**
 * @providesModule useSearchResults
 * @flow
 */

import * as React from 'react'
import { Orchard } from 'shared/orchard'
import getQueryParams from 'catalog/search_results/getQueryParams'

import type { Location } from 'react-router-dom'

export default function useSearchResults (
  location: Location
): [string[], boolean] {
  const queryParams = getQueryParams(location)

  const [loading, setLoading] = React.useState(true)
  const [caseSlugs, setCaseSlugs] = React.useState([])

  async function fetchResults () {
    setLoading(true)

    const results = await Orchard.harvest(`search`, queryParams)

    setLoading(false)
    setCaseSlugs(results)
  }

  React.useEffect(fetchResults, [location.pathname, location.search])

  return [caseSlugs, loading]
}
