/**
 * 
 */

import * as React from 'react'
import { Orchard, OrchardError } from 'shared/orchard'


export function hasSerializedReader () {
  return typeof window !== 'undefined' && window.reader != null
}

export function useReaderData () {
  const [reader, setReader] = React.useState(null)
  const [loading, setLoading] = React.useState(hasSerializedReader())

  React.useEffect(() => {
    if (!hasSerializedReader()) {
      setLoading(false)
      return
    }

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

export const ReaderDataContext = React.createContext({
  loading: true,
  reader: null,
  roles: { author: false, editor: false, instructor: false },
})

export function ReaderDataContextProvider ({
  children,
}) {
  const readerData = useReaderData()

  return (
    <ReaderDataContext.Provider value={readerData}>
      {children}
    </ReaderDataContext.Provider>
  )
}
