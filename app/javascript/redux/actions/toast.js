/**
 * @flow
 */

import * as React from 'react'
import { clearUnsaved, updateActiveCommunity } from 'redux/actions'

import { Intent } from '@blueprintjs/core'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { Notification } from 'redux/state'
import type { Toast } from '@blueprintjs/core'

export type DisplayToastAction = {
  type: 'DISPLAY_TOAST',
  options: Toast,
  key?: string,
}
export function displayToast (options: Toast, key?: string): DisplayToastAction {
  return { type: 'DISPLAY_TOAST', options, key }
}

export type DismissToastAction = {
  type: 'DISMISS_TOAST',
  key: string,
}
export function dismissToast (key: string): DismissToastAction {
  return { type: 'DISMISS_TOAST', key }
}

export type HandleNotificationAction = {
  type: 'HANDLE_NOTIFICATION',
  notification: Notification,
}
export function handleNotification (notification: Notification): ThunkAction {
  return (dispatch: Dispatch) => {
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

export type DisplayErrorToastOptions = { suggestReload?: boolean }
export function displayErrorToast (
  message: string | React.Node,
  options: ?DisplayErrorToastOptions
): ThunkAction {
  const { suggestReload } = options || {}

  return (dispatch: Dispatch) => {
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
