/**
 * 
 */

import * as React from 'react'
import { useImmer } from 'use-immer'

import { Orchard, OrchardError } from 'shared/orchard'
import { normalize } from 'shared/functions'



function ignoreUnauthorized (e) {
  if (!(e instanceof OrchardError && e.status === 401)) throw e
}

function useCatalogData () {
  const [data, update] = useImmer(getDefaultCatalogData())

  React.useEffect(() => {
    Orchard.harvest('announcements').then(announcements => {
      update(draft => {
        draft.announcements = announcements
      })
    })
  }, [])

  React.useEffect(() => {
    Orchard.harvest('cases').then(cases =>
      update(draft => {
        draft.cases = normalize(cases, 'slug')
        draft.loading = false
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('enrollments')
      .then(enrollments =>
        update(draft => {
          draft.enrollments = enrollments
        })
      )
      .catch(ignoreUnauthorized)
  }, [])

  React.useEffect(() => {
    Orchard.harvest('cases/features').then(({ features }) => {
      update(draft => {
        draft.features = features
      })
    })
  }, [])

  React.useEffect(() => {
    Orchard.harvest('catalog/libraries').then(libraries =>
      update(draft => {
        draft.libraries = libraries
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('saved_reading_lists')
      .then(lists =>
        update(draft => {
          draft.savedReadingLists = lists
        })
      )
      .catch(ignoreUnauthorized)
  }, [])

  React.useEffect(() => {
    Orchard.harvest('tags').then(tags =>
      update(draft => {
        draft.tags = tags
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('managerships')
      .then(managerships =>
        update(draft => {
          draft.managerships = managerships
        })
      )
      .catch(ignoreUnauthorized)
  }, [])

  return [data, update]
}

export const CatalogDataContext = React.createContext([getDefaultCatalogData(), () => {}])

function getDefaultCatalogData () {
  return {
    loading: true,
    announcements: [],
    cases: {},
    enrollments: [],
    features: [],
    libraries: [],
    managerships: [],
    savedReadingLists: [],
    tags: [],
  }
}

export function CatalogDataContextProvider ({
  children,
}) {
  const [catalogData, updateCatalogData] = useCatalogData()

  return (
    <CatalogDataContext.Provider value={[catalogData, updateCatalogData]}>
      {children}
    </CatalogDataContext.Provider>
  )
}
