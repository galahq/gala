/* @flow */

type ParsedError = {
  message: string,
  isTransient: boolean,
}

const TRANSIENT_PATTERNS = [
  'source',
  'layer',
  'cannot be removed',
  'does not exist',
  'undefined',
  'style is not done loading',
]

export function parseMapError (error: any): ParsedError {
  let message = 'Unknown error'

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error.error === 'string') {
    message = error.error
  } else if (error && typeof error.message === 'string') {
    message = error.message
  } else if (error && error.error && typeof error.error.message === 'string') {
    message = error.error.message
  } else if (error && error.status) {
    message = `HTTP ${error.status}`
  }

  const msgLower = message.toLowerCase()
  const isTransient = TRANSIENT_PATTERNS.some(pattern => msgLower.includes(pattern))

  return { message, isTransient }
}
