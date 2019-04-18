/**
 * @flow
 */

import * as React from 'react'
import { Orchard, OrchardError } from 'shared/orchard'

import type { Reader } from 'redux/state'

export type ReaderData = {|
  loading: boolean,
  reader: ?Reader,
  roles: {
    author: boolean,
    editor: boolean,
    instructor: boolean,
  },
|}

export function useReaderData () {
  const [reader, setReader] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Orchard.harvest('profile')
      .then(setReader)
      .catch(e => {
        if (!(e instanceof OrchardError && e.status === 401)) throw e
      })
      .then(() => setLoading(false))
  }, [])

  const author = !!reader?.anyEditorships
  const instructor = !!reader?.anyDeployments
  const editor = !!reader?.roles?.editor

  return { reader, loading, roles: { author, instructor, editor }}
}

export const ReaderDataContext = React.createContext<ReaderData>({
  loading: true,
  reader: null,
  roles: { author: false, editor: false, instructor: false },
})

export function ReaderDataContextProvider ({
  children,
}: {
  children: React.Node,
}) {
  const readerData = useReaderData()

  return (
    <ReaderDataContext.Provider value={readerData}>
      {children}
    </ReaderDataContext.Provider>
  )
}
