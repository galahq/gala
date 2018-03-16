/**
 * @flow
 */

import { setUnsaved } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, GetState, Dispatch } from 'redux/actions'
import type { Edgenote } from 'redux/state'

export function createEdgenote (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { slug } = getState().caseData
    return Orchard.graft(`cases/${slug}/edgenotes`, {}).then(
      (edgenote: Edgenote) => {
        dispatch(addEdgenote(edgenote.slug, edgenote))
        return edgenote.slug
      }
    )
  }
}

export type AddEdgenoteAction = {
  type: 'ADD_EDGENOTE',
  slug: string,
  data: Edgenote,
}
export function addEdgenote (slug: string, data: Edgenote): AddEdgenoteAction {
  return { type: 'ADD_EDGENOTE', slug, data }
}

export type UpdateEdgenoteAction = {
  type: 'UPDATE_EDGENOTE',
  slug: string,
  data: $Shape<Edgenote>,
}
export function updateEdgenote (
  slug: string,
  data: $Shape<Edgenote>
): UpdateEdgenoteAction {
  setUnsaved()
  return { type: 'UPDATE_EDGENOTE', slug, data }
}

export function deleteEdgenote (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (
      window.confirm(
        'Are you sure you want to delete this Edgenote? This action cannot be undone.'
      )
    ) {
      return Orchard.prune(`edgenotes/${slug}`).then(() =>
        dispatch(removeEdgenote(slug))
      )
    }
  }
}

export type RemoveEdgenoteAction = {
  type: 'REMOVE_EDGENOTE',
  slug: string,
}
function removeEdgenote (slug: string): RemoveEdgenoteAction {
  return { type: 'REMOVE_EDGENOTE', slug }
}

export type HighlightEdgenoteAction = {
  type: 'HIGHLIGHT_EDGENOTE',
  slug: string | null,
}
export function highlightEdgenote (
  slug: string | null
): HighlightEdgenoteAction {
  return { type: 'HIGHLIGHT_EDGENOTE', slug }
}

export type ActivateEdgenoteAction = {
  type: 'ACTIVATE_EDGENOTE',
  slug: string | null,
}
export function activateEdgenote (slug: string | null): ActivateEdgenoteAction {
  return { type: 'ACTIVATE_EDGENOTE', slug }
}
