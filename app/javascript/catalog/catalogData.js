/**
 * @flow
 */

import * as React from 'react'
import { useImmer } from 'use-immer'

import { Orchard, OrchardError } from 'shared/orchard'

import type { Case, Enrollment, Library, Tag } from 'redux/state'

export type CatalogData = {
  loading: boolean,
  cases: { [string]: Case },
  enrollments: Enrollment[],
  features: string[],
  tags: Tag[],
  libraries: Library[],
}

function useCatalogData (): [CatalogData, ((CatalogData) => void) => void] {
  const [data, update] = useImmer(getDefaultCatalogData())

  React.useEffect(() => {
    Orchard.harvest('cases').then(cases =>
      update(draft => {
        draft.cases = normalize(cases, 'slug')
        draft.loading = false
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('cases/features').then(({ features }) => {
      update(draft => {
        draft.features = features
      })
    })
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
    Orchard.harvest('tags').then(tags =>
      update(draft => {
        draft.tags = tags
      })
    )
  }, [])

  React.useEffect(() => {
    Orchard.harvest('catalog/libraries').then(libraries =>
      update(draft => {
        draft.libraries = libraries
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
    cases: {},
    enrollments: [],
    features: [],
    tags: [],
    libraries: [],
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

function normalize<T: {}> (array: T[], key: $Keys<T>): { [string]: T } {
  return array.reduce((table, element) => {
    table[element[key]] = element
    return table
  }, ({}: { [string]: T }))
}
