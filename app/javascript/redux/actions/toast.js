/**
 * @flow
 */

import { updateActiveCommunity } from 'redux/actions'

import { Intent } from '@blueprintjs/core'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { Notification } from 'redux/state'
import type { Toaster, Toast } from '@blueprintjs/core'

export type RegisterToasterAction = { type: 'REGISTER_TOASTER', toaster: any }
export function registerToaster (toaster: Toaster): RegisterToasterAction {
  return { type: 'REGISTER_TOASTER', toaster }
}
export type DisplayToastAction = { type: 'DISPLAY_TOAST', options: Toast }
export function displayToast (options: Toast): DisplayToastAction {
  return { type: 'DISPLAY_TOAST', options }
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
