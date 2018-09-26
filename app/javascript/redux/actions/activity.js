/**
 * @flow
 */

import { batchActions } from 'redux-batched-actions'
import { addPage, addCard, addEdgenote } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { Dispatch, ThunkAction } from 'redux/actions'
import type { Page, Card, Edgenote } from 'redux/state'

export function createActivity (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const { page, card, edgenote } = (await Orchard.graft(
      `cases/${caseSlug}/activities`,
      {}
    ): { page: Page, card: Card, edgenote: Edgenote })
    page.cards = [] // add card adds the card again, otherwise
    dispatch(
      batchActions([
        addPage(page),
        addCard(page.id, card),
        addEdgenote(edgenote.slug, edgenote),
      ])
    )
  }
}
