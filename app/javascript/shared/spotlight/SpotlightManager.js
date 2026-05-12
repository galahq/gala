/**
 * Ensures only the one, most important, unacknowledged spotlight is visible at
 * any time, using the observer pattern to notify spotlights of their
 * visibility.
 *
 * @providesModule SpotlightManager
 * 
 */

import { Orchard } from 'shared/orchard'



export default class SpotlightManager {
  unacknowledgedKeys

  get enabled () {
    return this._enabled
  }

  set enabled (value) {
    this._enabled = value
    this._notifySubscribers()
  }

  _current
  _enabled = true
  _subscribers = {}

  get _visible () {
    if (!this.enabled) return undefined

    const activeKey = this.unacknowledgedKeys.find(
      key => this._subscribers[key] && this._subscribers[key].length > 0
    )

    if (activeKey) {
      return this._subscribers[activeKey].sort(byDocumentPosition)[0]
    }
  }

  constructor (unacknowledgedKeys, { enabled = true } = {}) {
    this.unacknowledgedKeys = unacknowledgedKeys
    this._enabled = enabled
  }

  subscribe ({ key, ref }, setVisibility) {
    this._subscribersForKey(key).push({ key, ref, setVisibility })
    this._notifySubscribers()
  }

  unsubscribe ({ key, ref }) {
    this._subscribers[key] = this._subscribersForKey(key).filter(
      s => s.ref.current !== ref.current
    )

    this._notifySubscribers()
  }

  acknowledge (key) {
    this.unacknowledgedKeys = this.unacknowledgedKeys.filter(k => k !== key)
    this._notifySubscribers()
    this._createAcknowledgement(key)
  }

  _subscribersForKey (key) {
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

  _createAcknowledgement (key) {
    Orchard.graft('spotlight_acknowledgements', {
      spotlight_acknowledgement: { spotlight_key: key },
    })
  }
}

function byDocumentPosition (a, b) {
  const relativePosition = a.ref.current.compareDocumentPosition(b.ref.current)
  if (relativePosition & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (relativePosition & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}
