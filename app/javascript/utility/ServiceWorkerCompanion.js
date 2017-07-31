/**
 * @providesModule serviceWorkerCompanion
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'

import { Intent } from '@blueprintjs/core'

import { goOnline, goOffline, displayToast } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  const { slug, reader } = state.caseData
  return {
    readerSignedIn: !!reader,
    caseSlug: slug,
  }
}

type Props = {
  goOnline: typeof goOnline,
  goOffline: typeof goOffline,
  displayToast: typeof displayToast,
  readerSignedIn: boolean,
  caseSlug: string,
  intl: any,
}

class ServiceWorkerCompanion extends React.Component {
  props: Props

  _registerServiceWorker = () => {
    const { caseSlug, intl, displayToast } = this.props
    const { serviceWorker } = navigator
    if (serviceWorker) {
      serviceWorker.register(`/cases/${caseSlug}/case_service_worker.js`)

      serviceWorker.addEventListener('message', (event: { data: string }) => {
        console.log(event.data)
        if (event.data === 'CACHE_STALE') {
          displayToast({
            message: intl.formatMessage({
              id: 'offline.needsRefresh',
              defaultMessage: 'Updated data is available.',
            }),
            action: {
              text: intl.formatMessage({
                id: 'offline.refresh',
                defaultMessage: 'Refresh',
              }),
              iconName: 'refresh',
              onClick: () => location.reload(),
            },
            intent: Intent.SUCCESS,
            timeout: 0,
          })
        }
      })
    }
  }

  handleConnect = () => {
    this.props.goOnline()
  }
  handleDisconnect = () => {
    this.props.goOffline()
  }

  componentDidMount () {
    const { readerSignedIn } = this.props
    if (readerSignedIn) this._registerServiceWorker()

    window.addEventListener('online', this.handleConnect)
    window.addEventListener('offline', this.handleDisconnect)
  }

  render () {
    return null
  }
}

export default injectIntl(
  connect(mapStateToProps, { goOnline, goOffline, displayToast })(
    ServiceWorkerCompanion
  )
)

function registerServiceWorker (caseSlug: string) {}
