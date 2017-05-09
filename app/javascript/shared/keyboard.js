/**
 * @flow
 */

export function acceptKeyboardClick (func: () => mixed): KeyboardEvent => mixed {
  return (event: KeyboardEvent) => {
    event.preventDefault()
    if (event.key === 'Enter' || event.key === ' ') func()
  }
}

export function hotkeyDispatch (
  keys: { [keyName: string]: () => mixed },
  defaultFunc: ?() => mixed = null
): KeyboardEvent => mixed {
  return (event: KeyboardEvent) => {
    if (keys.hasOwnProperty(event.key)) {
      const shouldContinue = keys[event.key]()
      shouldContinue || event.preventDefault()
    } else if (defaultFunc) {
      defaultFunc(event)
    }
  }
}
