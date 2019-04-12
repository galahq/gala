/**
 * @providesModule ReadingListEditor
 * @flow
 */

import * as React from 'react'
import ReadingListItems from 'reading_list/ReadingListItems'

import { Orchard } from 'shared/orchard'
import { normalize } from 'shared/functions'

import type { Case, ReadingListItem } from 'redux/state'

function ReadingListEditor () {
  const [cases, setCases] = React.useState<{ [string]: Case }>({})

  React.useEffect(() => {
    Orchard.harvest('cases').then(cases => setCases(normalize(cases, 'slug')))
  }, [])

  const [readingListItems, setReadingListItems] = React.useState<
    ReadingListItem[]
  >([])

  return (
    <>
      <ReadingListItems
        cases={cases}
        items={readingListItems}
        onSetItems={setReadingListItems}
      />
    </>
  )
}

export default ReadingListEditor
