/**
 * @providesModule ReadingListItems
 * @flow
 */

import * as React from 'react'
import produce from 'immer'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'

import ReadingListItem from 'reading_list/ReadingListItem'

import type { IntlShape } from 'react-intl'
import type { Case, ReadingListItem as ReadingListItemT } from 'redux/state'

type Props = {
  cases: { string: Case },
  intl: IntlShape,
  items: ReadingListItemT[],
  lastItemRef: any => void,
  onSetItems: (ReadingListItemT[]) => void,
}

function ReadingListItems ({
  cases,
  intl,
  items,
  lastItemRef,
  onSetItems,
}: Props) {
  return (
    <Container>
      {items.map((item, index) => {
        const caseData = cases[item.caseSlug]

        return (
          <ReadingListItem
            key={item.caseSlug}
            ref={lastItemRef}
            intl={intl}
            item={item}
            caseData={caseData}
            onChange={item => {
              onSetItems(
                produce(items, draft => {
                  draft[index] = item
                })
              )
            }}
            onDelete={() => {
              onSetItems(
                produce(items, draft => {
                  draft.splice(index, 1)
                })
              )
            }}
          />
        )
      })}
    </Container>
  )
}

export default injectIntl(ReadingListItems)

const Container = styled.ul`
  list-style: none;
  padding: 0;
`
