/* @flow */

import type { PodcastsState } from 'redux/state'
import type { UpdatePodcastAction, AddPodcastAction } from 'redux/actions'

export default function podcastsById (
  state: PodcastsState = ({ ...window.caseData.podcasts }: PodcastsState),
  action: UpdatePodcastAction | AddPodcastAction
): PodcastsState {
  switch (action.type) {
    case 'UPDATE_PODCAST':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case 'ADD_PODCAST':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default:
      return state
  }
}
