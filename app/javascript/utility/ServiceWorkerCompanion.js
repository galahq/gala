/**
 * @providesModule serviceWorkerCompanion
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { goOnline, goOffline } from 'redux/actions'

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
  readerSignedIn: boolean,
  caseSlug: string,
}

class ServiceWorkerCompanion extends React.Component {
  props: Props

  handleConnect = () => {
    this.props.goOnline()
  }
  handleDisconnect = () => {
    this.props.goOffline()
  }

  componentDidMount () {
    const { readerSignedIn, caseSlug } = this.props
    if (readerSignedIn) registerServiceWorker(caseSlug)

    window.addEventListener('online', this.handleConnect)
    window.addEventListener('offline', this.handleDisconnect)
  }
  render () {
    return null
  }
}

export default connect(mapStateToProps, { goOnline, goOffline })(
  ServiceWorkerCompanion
)

function registerServiceWorker (caseSlug: string) {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register(
      `/cases/${caseSlug}/case_service_worker.js`
    )
  }
}
