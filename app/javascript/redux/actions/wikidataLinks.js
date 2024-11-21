/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

import type { Dispatch, ThunkAction } from 'redux/actions'
import type { WikidataLinks } from 'redux/state'

export type SyncWikidataLinksAction = {
  type: 'SYNC_WIKIDATA_LINKS',
  data: WikidataLinks
}

export function syncWikidataLinks (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const wikiDataLinks = (await Orchard.graft(
      `cases/${caseSlug}/wikidata_links`,
      []
    ): any)

    console.log(wikiDataLinks)

    // page.cards = [] // add card adds the card again, otherwise
    // dispatch(
    //   batchActions([
    //     addPage(page),
    //     addCard(page.id, card),
    //     addEdgenote(edgenote.slug, edgenote),
    //   ])
    // )
  }
}
