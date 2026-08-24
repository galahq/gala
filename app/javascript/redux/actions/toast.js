/**
 * 
 */

import * as React from 'react'
import { clearUnsaved, updateActiveCommunity } from 'redux/actions'

import { Intent } from '@blueprintjs/core'


export function displayToast (options, key) {
  return { type: 'DISPLAY_TOAST', options, key }
}

export function dismissToast (key) {
  return { type: 'DISMISS_TOAST', key }
}

export function handleNotification (notification) {
  return (dispatch) => {
    const { message, case: kase, commentThreadId, community } = notification
    dispatch(
      displayToast({
        message,
        intent: Intent.PRIMARY,
        action: {
          onClick: _ => {
            dispatch(updateActiveCommunity(kase.slug, community.id)).then(
              () => {
                window.location = `/cases/${
                  kase.slug
                }/conversation/${commentThreadId}`
              }
            )
          },
          text: 'Read',
        },
      })
    )
  }
}

export function displayErrorToast (
  message,
  options
) {
  const { suggestReload } = options || {}

  return (dispatch) => {
    const action = suggestReload
      ? {
          text: 'Reload',
          onClick: () => {
            clearUnsaved()
            window.location.reload()
          },
        }
      : undefined

    dispatch(
      displayToast({
        intent: Intent.DANGER,
        icon: 'error',
        message: <span style={{ whiteSpace: 'pre-wrap' }}>{message}</span>,
        action,
      })
    )
  }
}
