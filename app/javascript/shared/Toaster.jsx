/**
 * @providesModule Toaster
 *
 */

import { OverlayToaster } from '@blueprintjs/core'

// Blueprint 5+ renamed Toaster to OverlayToaster and made `create()` async
// (it returns Promise<Toaster>). Resolve the singleton once and forward the
// existing synchronous, fire-and-forget call sites (Toaster.show / .dismiss /
// .clear, whose return values are unused) through the promise.
const toasterPromise = OverlayToaster.create()

const Toaster = {
  show: (...args) => toasterPromise.then(toaster => toaster.show(...args)),
  dismiss: (...args) => toasterPromise.then(toaster => toaster.dismiss(...args)),
  clear: (...args) => toasterPromise.then(toaster => toaster.clear(...args)),
}

export default Toaster
