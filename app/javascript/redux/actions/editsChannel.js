/**
 * @flow
 */

import { sessionId } from 'shared/orchard'
import * as A from 'redux/actions'

function mapBroadcastToAction (type, watchable) {
  switch (watchable.type) {
    case 'Card':
      switch (type) {
        case 'create':
          return A.addCard(watchable.pageId, watchable)
        case 'update':
          return A.replaceCard(watchable.param, watchable)
        case 'destroy':
          return A.removeCard(watchable.param)
      }
      break

    case 'Case':
      switch (type) {
        case 'update':
          return A.updateCase(watchable, false)
      }
      break

    case 'Edgenote':
      switch (type) {
        case 'create':
          return A.addEdgenote(watchable.param, watchable)
        case 'update':
          return A.updateEdgenote(watchable.param, watchable, false)
        case 'destroy':
          return A.removeEdgenote(watchable.param)
      }
      break

    case 'Page':
      switch (type) {
        case 'create':
          return A.addPage(watchable)
        case 'update':
          return A.updatePage(watchable.param, watchable, false)
        case 'destroy':
          return A.removePage(watchable.param)
      }
      break

    case 'Podcast':
      switch (type) {
        case 'create':
          return A.addPodcast(watchable)
        case 'update':
          return A.updatePodcast(watchable.param, watchable, false)
        case 'destroy':
          return A.removePodcast(watchable.param)
      }
      break

    case 'Lock':
      switch (type) {
        case 'create':
          return A.addLock(watchable)
        case 'destroy':
          return A.removeLock(watchable.param)
      }
      break
  }
}

export function subscribeToEditsChannel (): A.ThunkAction {
  return (dispatch: A.Dispatch, getState: A.GetState) => {
    if (!('WebSocket' in window)) return

    const { slug } = getState().caseData

    if (
      App.edits != null &&
      typeof App.edits.unsubscribe === 'function'
    ) {
      App.edits.unsubscribe()
      delete App.edits
    }

    App.edits = App.cable.subscriptions.create(
      { channel: 'EditsChannel', case_slug: slug },
      {
        received: ({ type, watchable, editor_session_id: editorSessionId }) => {
          if (editorSessionId === sessionId()) {
            return
          }

          dispatch((mapBroadcastToAction(type, watchable): any))
        },
      }
    )
  }
}
