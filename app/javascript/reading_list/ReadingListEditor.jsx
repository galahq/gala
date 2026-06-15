/**
 * @providesModule ReadingListEditor
 *
 */

import * as React from 'react'
import { omit } from 'ramda'

import ReadingListItems from 'reading_list/ReadingListItems'
import CaseChooser from 'reading_list/CaseChooser'
import HiddenFormInputs from 'reading_list/HiddenFormInputs'

import { Orchard } from 'shared/orchard'
import { normalize } from 'shared/functions'
import { useControllableFocus } from 'utility/hooks'



function ReadingListEditor ({ initialItems }) {
  const [cases, setCases] = React.useState({})

  React.useEffect(() => {
    Orchard.harvest('cases').then(cases => setCases(normalize(cases, 'slug')))
  }, [])

  const [readingListItems, setReadingListItems] = React.useState(initialItems)

  const [lastItemRef, focusLastItem] = useControllableFocus()

  const unselectedCases = omit(readingListItems.map(x => x.caseSlug), cases)

  return (
    <>
      <ReadingListItems
        cases={cases}
        items={readingListItems}
        lastItemRef={lastItemRef}
        onSetItems={setReadingListItems}
      />

      <CaseChooser cases={unselectedCases} onSelect={handleAddCase} />

      <HiddenFormInputs initialItems={initialItems} items={readingListItems} />
    </>
  )

  function handleAddCase (caseSlug) {
    setReadingListItems(value => [
      ...value,
      {
        caseSlug,
        notes: '',
        param: '',
      },
    ])

    focusLastItem()
  }
}

export default ReadingListEditor
