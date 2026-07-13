/**
 * @providesModule Orchard
 * 
 */

import * as R from 'ramda'
import qs from 'qs'
import uuid from 'uuid/v4'

export class Orchard {
  static harvest (endpoint, params = null) {
    const query = params
      ? `?${qs.stringify(params, { arrayFormat: 'brackets' })}`
      : ''
    const r = new Request(`${resolve(endpoint)}${query}`, {
      credentials: 'same-origin',
    })
    return fetch(r).then(handleResponse)
  }

  static graft (endpoint, params = {}) {
    const body = JSON.stringify(params)
    const r = new Request(resolve(endpoint), {
      credentials: 'same-origin',
      method: 'POST',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId(),
        ...CSRF.header(),
      }),
    })
    return fetch(r).then(handleResponse)
  }

  // Train a fruit tree to grow into a desired figure.
  static espalier (endpoint, params = {}) {
    const body = JSON.stringify(params)
    const r = new Request(resolve(endpoint), {
      credentials: 'same-origin',
      method: 'PUT',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId(),
        ...CSRF.header(),
      }),
    })
    return fetch(r).then(handleResponse)
  }

  static prune (endpoint) {
    const r = new Request(resolve(endpoint), {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: new Headers({
        Accept: 'application/json',
        'X-Session-ID': sessionId(),
        ...CSRF.header(),
      }),
    })
    return fetch(r).then(handleResponse)
  }
}
window.Orchard = Orchard

function resolve (endpoint) {
  if (endpoint.startsWith('/')) {
    return endpoint
  } else {
    return `/${endpoint}.json`
  }
}

export const CSRF = {
  header () {
    const token = CSRF.token()
    if (token == null) return {}
    return { 'X-CSRF-Token': token }
  },

  param () {
    const paramName = getMetaContent('csrf-param')
    const token = CSRF.token()
    if (paramName == null || token == null) return {}
    return { [paramName]: token }
  },

  token () {
    return getMetaContent('csrf-token')
  },
}

function getMetaContent (key) {
  const meta = document.querySelector(`meta[name="${key}"]`)
  return meta && meta.getAttribute('content')
}

export class OrchardError extends Error {
  status
  url

  constructor (response, message) {
    super(message || `${response.status} ${response.statusText}`)
    this.url = response.url
    this.status = response.status
    this.name = 'OrchardError'
  }
}

export class OrchardInputError extends OrchardError {
  constructor (response, message) {
    super(response, message)
    this.name = 'OrchardInputError'
  }
}

// Silently swallow the expected client errors an action can hit (permission / lock /
// conflict / already-gone). React 19 surfaces uncaught promise rejections as an error
// overlay, so any Orchard call that can reject this way needs a catch; this keeps that
// handling silent (no toast) per convention, while still logging the unexpected. Same
// shape as catalogData's `ignoreUnauthorized`, broadened to the full client-error range.
const EXPECTED_CLIENT_ERROR_STATUSES = [401, 403, 404, 409, 423]

export function ignoreClientError (e) {
  if (
    e instanceof OrchardError &&
    EXPECTED_CLIENT_ERROR_STATUSES.includes(e.status)
  ) {
    return
  }
  console.error(e)
}

export async function handleResponse (response) {
  if (response.ok) {
    return handleSuccessfulResponse(response)
  } else {
    return handleUnsuccessfulResponse(response)
  }
}

async function handleSuccessfulResponse (response) {
  try {
    const contentType = response.headers.get('Content-Type')
    if (contentType != null) {
      if (contentType.match('application/json')) {
        const text = await response.text()
        if (text.length === 0) return undefined
        return JSON.parse(text)
      } else {
        return await response.text()
      }
    }
  } catch {
    throw new OrchardError(response, 'Malformed response')
  }
}

async function handleUnsuccessfulResponse (response) {
  if (response.status === 422) {
    const errorResponse = await response.json()
    throw new OrchardInputError(response, formatErrors(errorResponse))
  } else {
    throw new OrchardError(response)
  }
}

function formatAttributeName (name) {
  return name
    .replace('_', ' ')
    .replace(/./, (letter, i) => (i === 0 ? letter.toUpperCase() : letter))
}


export function formatErrors (errorResponse) {
  return R.flatten(
    R.map(([key, values]) => {
      if (!Array.isArray(values)) {
        return `${formatAttributeName(key)} ${values}.`
      }
      return R.map(value => `${formatAttributeName(key)} ${value}.`, values)
    }, R.toPairs(errorResponse))
  ).join('\n')
}

export function sessionId () {
  window.sessionId || (window.sessionId = uuid())
  return window.sessionId
}
