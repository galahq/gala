/**
 * @flow
 */

import { Toaster } from '@blueprintjs/core'

// So this is a necessary but TEMP TEMP TEMP solution because in React 16,
// ReactDOM.render doesn’t return a ref for the Toaster. This might be because
// Blueprint are hiding the React bits of Toaster from us, which might confuse
// React about whether it’s stateless or not. Blueprint have plans to adopt
// ReactDOM.createPortal which should let us delete this, but until then...
const hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet = (
  callback: Toaster => any
) => {
  // Put the toaster somewhere we can find it
  const toasterContainerContainer = document.createElement('div')
  document.body && document.body.appendChild(toasterContainerContainer)
  Toaster.create({}, toasterContainerContainer)

  // Find it
  const toasterContainer = (toasterContainerContainer.children[0]: any)
  if (toasterContainer == null) return

  // React has at this point scheduled the rendering of the Toaster; now we
  // wait until that render step is committed
  const internalReactRootContainer = toasterContainer._reactRootContainer
  const pollForRender = setInterval(() => {
    if (internalReactRootContainer.isScheduled) return

    const child = internalReactRootContainer.current.child
    if (child.type !== Toaster) return

    // And when we finally find a toaster, we can stop waiting and dispatch a
    // ref of it to the redux store
    clearInterval(pollForRender)
    callback(child.stateNode)
  }, 50)

  // But don’t look forever... it’s not *that* bad without notifications
  setTimeout(() => clearInterval(pollForRender), 2000)
}

export default hackIntoReactAndCreateAToasterBecauseBlueprintDoesntSupportFiberYet
