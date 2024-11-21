/**
 * @providesModule wikiDataLinks
 * @flow
 */

import type { WikiDataLinksState } from 'redux/state'
import type { SyncWikidataLinksAction } from 'redux/actions'

type Action = SyncWikidataLinksAction

export default function wikiDataLinks (
  state: WikiDataLinksState = {},
  action: Action
): WikiDataLinksState {
  switch (action.type) {
    case 'SYNC_WIKIDATA_LINKS':
      const newState = {
        ...state,
        [action.data.caseSlug]: action.data.wikidataLinks,
      }
      console.log(newState)
      return newState

    default:
      return state
  }
}
