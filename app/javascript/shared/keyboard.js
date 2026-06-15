/**
 *
 */

export function acceptKeyboardClick (event) {
  event.preventDefault()
  if (event.key === 'Enter' || event.key === ' ') event.currentTarget.click()
}

export function hotkeyDispatch (
  keys,
  defaultFunc = null
) {
  return (event) => {
    if (keys.hasOwnProperty(event.key)) {
      const shouldContinue = keys[event.key]()
      shouldContinue || event.preventDefault()
    } else if (defaultFunc) {
      defaultFunc(event)
    }
  }
}
