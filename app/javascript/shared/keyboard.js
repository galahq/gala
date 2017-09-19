/**
 * @flow
 */

export function acceptKeyboardClick (event: SyntheticKeyboardEvent) {
  event.preventDefault()
  // $FlowFixMe
  if (event.key === 'Enter' || event.key === ' ') event.currentTarget.click()
}

export function hotkeyDispatch (
  keys: { [keyName: string]: () => mixed },
  defaultFunc: ?(SyntheticEvent) => mixed = null
): SyntheticKeyboardEvent => mixed {
  return (event: SyntheticKeyboardEvent) => {
    if (keys.hasOwnProperty(event.key)) {
      const shouldContinue = keys[event.key]()
      shouldContinue || event.preventDefault()
    } else if (defaultFunc) {
      defaultFunc(event)
    }
  }
}
