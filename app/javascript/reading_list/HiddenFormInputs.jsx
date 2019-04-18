/**
 * @providesModule HiddenFormInputs
 * @flow
 */

import * as React from 'react'

import type { ReadingListItem } from 'redux/state'

type Props = {
  initialItems: ReadingListItem[],
  items: ReadingListItem[],
}

function HiddenFormInputs ({ initialItems, items }: Props) {
  return (
    <>
      {items.map(({ caseSlug, notes, param }, index) => (
        <React.Fragment key={caseSlug}>
          <HiddenInput index={index} attribute="case_slug" value={caseSlug} />
          <HiddenInput index={index} attribute="notes" value={notes} />
          <HiddenInput index={index} attribute="id" value={param} />
          <HiddenInput index={index} attribute="position" value={index + 1} />
        </React.Fragment>
      ))}

      {initialItems
        .filter(initialItem =>
          items.every(item => item.param !== initialItem.param)
        )
        .map(({ caseSlug, param }, i) => {
          const index = i + items.length
          return (
            <React.Fragment key={caseSlug}>
              <HiddenInput index={index} attribute="id" value={param} />
              <HiddenInput index={index} attribute="_destroy" value="true" />
            </React.Fragment>
          )
        })}
    </>
  )
}

export default HiddenFormInputs

function HiddenInput ({ attribute, index, value }) {
  return (
    <input
      readOnly
      name={`reading_list[reading_list_items_attributes][${index}][${attribute}]`}
      type="hidden"
      value={value}
    />
  )
}
