/**
 * @providesModule HiddenFormInputs
 * @flow
 */

import * as React from 'react'

import type { ReadingListItem } from 'redux/state'

type Props = {
  items: ReadingListItem[],
}

function HiddenFormInputs ({ items }: Props): React.Node[] {
  return items.map(({ caseSlug, notes, param }, index) => (
    <React.Fragment key={caseSlug}>
      <input
        readOnly
        name={`reading_list[reading_list_items_attributes][${index}][case_slug]`}
        type="hidden"
        value={caseSlug}
      />
      <input
        readOnly
        name={`reading_list[reading_list_items_attributes][${index}][notes]`}
        type="hidden"
        value={notes}
      />
      <input
        readOnly
        name={`reading_list[reading_list_items_attributes][${index}][id]`}
        type="hidden"
        value={param}
      />
      <input
        readOnly
        name={`reading_list[reading_list_items_attributes][${index}][position]`}
        type="hidden"
        value={index}
      />
    </React.Fragment>
  ))
}

export default HiddenFormInputs
