/**
 * Ensures only the one, most important, unacknowledged spotlight is visible at
 * any time, using the observer pattern to notify spotlights of their
 * visibility.
 *
 * @providesModule SpotlightManager
 * @flow
 */

import { Orchard } from 'shared/orchard'
import { OrchardError } from 'shared/orchard'

type SubscriberOptions = { key: string, ref: { current: Node } }
type Subscriber = SubscriberOptions & {
  setVisibility: boolean => mixed,
}

type Options = { enabled?: boolean }

export default class SpotlightManager {
  unacknowledgedKeys: string[]

  get enabled () {
    return this._enabled
  }

  set enabled (value: boolean) {
    this._enabled = value
    this._notifySubscribers()
  }

  _current: ?Subscriber
  _enabled: boolean = true
  _subscribers: { [key: string]: Subscriber[] } = {}

  get _visible () {
    if (!this.enabled) return undefined

    const activeKey = this.unacknowledgedKeys.find(
      key => this._subscribers[key] && this._subscribers[key].length > 0
    )

    if (activeKey) {
      return this._subscribers[activeKey].sort(byDocumentPosition)[0]
    }
  }

  constructor (unacknowledgedKeys: string[], { enabled = true }: Options = {}) {
    this.unacknowledgedKeys = unacknowledgedKeys
    this._enabled = enabled
  }

  subscribe ({ key, ref }: SubscriberOptions, setVisibility: boolean => mixed) {
    this._subscribersForKey(key).push({ key, ref, setVisibility })
    this._notifySubscribers()
  }

  unsubscribe ({ key, ref }: SubscriberOptions) {
    this._subscribers[key] = this._subscribersForKey(key).filter(
      s => s.ref.current !== ref.current
    )

    this._notifySubscribers()
  }

  acknowledge (key: string) {
    this.unacknowledgedKeys = this.unacknowledgedKeys.filter(k => k !== key)
    this._notifySubscribers()
    this._createAcknowledgement(key)
  }

  _subscribersForKey (key: string) {
    if (!this._subscribers.hasOwnProperty(key)) {
      this._subscribers[key] = []
    }

    return this._subscribers[key]
  }

  _notifySubscribers () {
    if (this._visible === this._current) return

    this._visible && this._visible.setVisibility(true)
    this._current && this._current.setVisibility(false)
    this._current = this._visible
  }

  _createAcknowledgement (key: string) {
    Orchard.graft('spotlight_acknowledgements', {
      spotlight_acknowledgement: { spotlight_key: key },
    }).catch(error => {
      // Ignore malformed response error since we expect an empty response
      if (!(error instanceof OrchardError) || error.message !== 'Malformed response') {
        throw error
      }
    })
  }
}

function byDocumentPosition (a: Subscriber, b: Subscriber) {
  const relativePosition = a.ref.current.compareDocumentPosition(b.ref.current)
  if (relativePosition & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (relativePosition & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}
