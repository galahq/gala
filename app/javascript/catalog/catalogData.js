/**
 * @flow
 */

import * as React from 'react'
import { useImmer } from 'use-immer'

import { Orchard, OrchardError } from 'shared/orchard'
import { normalize } from 'shared/functions'

import type {
  Announcement,
  Case,
  Enrollment,
  Library,
  ReadingList,
  Tag,
} from 'redux/state'

export type CatalogData = {
  loading: boolean,
  announcements: Announcement[],
  cases: { [string]: Case },
  enrollments: Enrollment[],
  features: string[],
  libraries: Library[],
  savedReadingLists: ReadingList[],
  tags: Tag[],
}

function useCatalogData (): [CatalogData, ((CatalogData) => void) => void] {
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
      .catch(e => {
        if (!(e instanceof OrchardError && e.status === 401)) throw e
      })
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
    Orchard.harvest('saved_reading_lists').then(lists =>
      update(draft => {
        draft.savedReadingLists = lists
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('tags').then(tags =>
      update(draft => {
        draft.tags = tags
      })
    )
  }, [])

  return [data, update]
}

export const CatalogDataContext = React.createContext<
  [CatalogData, ((CatalogData) => void) => void]
>([getDefaultCatalogData(), () => {}])

function getDefaultCatalogData () {
  return {
    loading: true,
    announcements: [],
    cases: {},
    enrollments: [],
    features: [],
    libraries: [],
    savedReadingLists: [],
    tags: [],
  }
}

export function CatalogDataContextProvider ({
  children,
}: {
  children: React.Node,
}) {
  const [catalogData, updateCatalogData] = useCatalogData()

  return (
    <CatalogDataContext.Provider value={[catalogData, updateCatalogData]}>
      {children}
    </CatalogDataContext.Provider>
  )
}
