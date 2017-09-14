/**
 * @providesModule Orchard
 * @flow
 */

import { append, keys } from 'ramda'

type ErrorResponse = {
  [string]: string[],
}

export class Orchard {
  static harvest (endpoint: string): Promise<any> {
    let r = new Request(
      `${window.galaHostname || ''}/${window.i18n.locale}/${endpoint}.json`,
      { credentials: 'same-origin' }
    )
    return fetch(r).then(this._handleResponse)
  }

  static graft (endpoint: string, params: Object): Promise<any> {
    let body = JSON.stringify(params)
    let r = new Request(`/${window.i18n.locale}/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'POST',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
    return fetch(r).then(this._handleResponse)
  }

  // Train a fruit tree to grow into a desired figure.
  static espalier (endpoint: string, params: ?Object): Promise<any> {
    let body = JSON.stringify(params)
    let r = new Request(`/${window.i18n.locale}/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'PUT',
      body,
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
    return fetch(r).then(this._handleResponse)
  }

  static prune (endpoint: string): Promise<Response> {
    let r = new Request(`/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: new Headers({ Accept: 'application/json' }),
    })
    return fetch(r)
  }

  static _handleResponse (response: Response): Promise<any> {
    if (response.ok) {
      return response.json()
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
}
