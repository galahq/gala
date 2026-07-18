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
      subscriber => subscriber.ref !== ref
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
    const visible = this._visible
    if (visible === this._current) return

    visible && visible.setVisibility(true)
    this._current && this._current.setVisibility(false)
    this._current = visible
  }

  _createAcknowledgement (key) {
    Orchard.graft('spotlight_acknowledgements', {
      spotlight_acknowledgement: { spotlight_key: key },
    })
  }
}

function byDocumentPosition (a, b) {
  const aNode = a.ref && a.ref.current
  const bNode = b.ref && b.ref.current

  if (!aNode && !bNode) return 0
  if (!aNode) return 1
  if (!bNode) return -1

  const relativePosition = aNode.compareDocumentPosition(bNode)
  if (relativePosition & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (relativePosition & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}
