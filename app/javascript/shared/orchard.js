/**
 * @providesModule Orchard
 * @flow
 */

import { append, keys } from 'ramda'
import qs from 'qs'

type ErrorResponse = {
  [string]: string[],
}

export class Orchard {
  static harvest (endpoint: string, params: Object = {}): Promise<any> {
    const query = params
      ? `?${qs.stringify(params, { arrayFormat: 'brackets' })}`
      : ''
    const r = new Request(
      `${window.galaHostname || ''}/${
        window.i18n.locale
      }/${endpoint}.json${query}`,
      { credentials: 'same-origin' }
    )
    return fetch(r).then(handleResponse)
  }

  static graft (endpoint: string, params: Object): Promise<any> {
    const body = JSON.stringify(params)
    const r = new Request(`/${window.i18n.locale}/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'POST',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...CSRF.header(),
      }),
    })
    return fetch(r).then(handleResponse)
  }

  // Train a fruit tree to grow into a desired figure.
  static espalier (endpoint: string, params: ?Object): Promise<any> {
    const body = JSON.stringify(params)
    const r = new Request(`/${window.i18n.locale}/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'PUT',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...CSRF.header(),
      }),
    })
    return fetch(r).then(handleResponse)
  }

  static prune (endpoint: string): Promise<Response> {
    const r = new Request(`/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: new Headers({ Accept: 'application/json', ...CSRF.header() }),
    })
    return fetch(r)
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

function handleResponse (response: Response): Promise<any> {
  if (response.ok) {
    return response.json().catch(() => Promise.resolve(true))
  } else {
    return response.json().then((errorResponse: ErrorResponse) => {
      const errorFieldNames = keys(errorResponse)

      const errorMessages = errorFieldNames
        .reduce((all: string[], fieldName: string) => {
          const fieldErrors = errorResponse[fieldName]

          if (fieldErrors != null && Array.isArray(fieldErrors)) {
            return append(
              fieldErrors
                .map(
                  err =>
                    `${fieldName} ${typeof err === 'string' ? err : 'error'}`
                )
                .join('\n'),
              all
            )
          }

          return [...all, `${fieldName}: error`]
        }, [])
        .join('\n')

      var e = Error(errorMessages)
      e.name = 'OrchardError'
      throw e
    })
  }
}
