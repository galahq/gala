/**
 *
 */

import { batchActions } from 'redux-batched-actions'
import { addPage, addCard, addEdgenote } from 'redux/actions'

import { Orchard, ignoreClientError } from 'shared/orchard'


export function createActivity (caseSlug) {
  return async (dispatch) => {
    try {
      const { page, card, edgenote } = await Orchard.graft(
        `cases/${caseSlug}/activities`,
        {}
      )
      page.cards = [] // add card adds the card again, otherwise
      dispatch(
        batchActions([
          addPage(page),
          addCard(page.id, card),
          addEdgenote(edgenote.slug, edgenote),
        ])
      )
    } catch (e) {
      ignoreClientError(e) // 403 (lost edit rights) / 404 (stale slug)
    }
  }
}
