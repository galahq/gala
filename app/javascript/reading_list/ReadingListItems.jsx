/**
 * @providesModule ReadingListItems
 * @flow
 */

import * as React from 'react'
import { Button, FormGroup, Intent } from '@blueprintjs/core'

import { Element } from 'catalog/shared'

import type { Case, ReadingListItem } from 'redux/state'

type Props = {
  cases: { string: Case },
  items: ReadingListItem[],
  onSetItems: (ReadingListItem[]) => void,
}

function ReadingListItems ({ cases, items, onSetItems }: Props) {
  return (
    <ul>
      {items.map(item => {
        const caseData = cases[item.caseSlug]

        return (
          <li key={item.caseSlug}>
            <Element
              image={caseData?.smallCoverUrl}
              text={caseData?.kicker}
              rightElement={
                <Button minimal intent={Intent.DANGER} icon="trash" />
              }
            />
            <FormGroup label={'Notes'}>
              <textarea className="pt-input pt-fill" value={item.notes} />
            </FormGroup>
          </li>
        )
      })}
    </ul>
  )
}

export default ReadingListItems
