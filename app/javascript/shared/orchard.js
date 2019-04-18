/**
 * @providesModule Orchard
 * @flow
 */

import * as R from 'ramda'
import qs from 'qs'
import uuid from 'uuid/v4'

export class Orchard {
  static harvest (endpoint: string, params: ?Object = null): Promise<any> {
    const query = params
      ? `?${qs.stringify(params, { arrayFormat: 'brackets' })}`
      : ''
    const r = new Request(`${resolve(endpoint)}${query}`, {
      credentials: 'same-origin',
    })
    return fetch(r).then(handleResponse)
  }

  static graft (endpoint: string, params: Object = {}): Promise<any> {
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
  static espalier (endpoint: string, params: Object = {}): Promise<any> {
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

  static prune (endpoint: string): Promise<Response> {
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

function resolve (endpoint: string) {
  if (endpoint.startsWith('/')) {
    return endpoint
  } else {
    return `/${endpoint}.json`
  }
}

export const CSRF = {
  header (): { [string]: string } {
    const token = CSRF.token()
    if (token == null) return {}
    return { 'X-CSRF-Token': token }
  },

  param (): { [string]: string } {
    const paramName = getMetaContent('csrf-param')
    const token = CSRF.token()
    if (paramName == null || token == null) return {}
    return { [paramName]: token }
  },

  token (): ?string {
    return getMetaContent('csrf-token')
  },
}

function getMetaContent (key: string): ?string {
  const meta = document.querySelector(`meta[name="${key}"]`)
  return meta && meta.getAttribute('content')
}

export class OrchardError extends Error {
  status: number
  url: string

  constructor (response: Response, message: ?string) {
    super(message || `${response.status} ${response.statusText}`)
    this.url = response.url
    this.status = response.status
    this.name = 'OrchardError'
  }
}

export class OrchardInputError extends OrchardError {
  constructor (response: Response, message: string) {
    super(response, message)
    this.name = 'OrchardInputError'
  }
}

export async function handleResponse (response: Response) {
  if (response.ok) {
    return handleSuccessfulResponse(response)
  } else {
    return handleUnsuccessfulResponse(response)
  }
}

async function handleSuccessfulResponse (response: Response): Promise<any> {
  try {
    const contentType = response.headers.get('Content-Type')
    if (contentType != null) {
      if (contentType.match('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    }
  } catch {
    throw new OrchardError(response, 'Malformed response')
  }
}

async function handleUnsuccessfulResponse (response: Response) {
  if (response.status === 422) {
    const errorResponse = await response.json()
    throw new OrchardInputError(response, formatErrors(errorResponse))
  } else {
    throw new OrchardError(response)
  }
}

function formatAttributeName (name: string) {
  return name
    .replace('_', ' ')
    .replace(/./, (letter, i) => (i === 0 ? letter.toUpperCase() : letter))
}

type ErrorResponse = {
  [string]: string[],
}

export function formatErrors (errorResponse: ErrorResponse): string {
  return R.flatten(
    R.map(([key, values]) => {
      if (!Array.isArray(values)) {
        return `${formatAttributeName(key)} ${values}.`
      }
      return R.map(value => `${formatAttributeName(key)} ${value}.`, values)
    }, R.toPairs(errorResponse))
  ).join('\n')
}

export function sessionId (): string {
  window.sessionId || (window.sessionId = uuid())
  return window.sessionId
}
