// @flow
export class Orchard {
  static harvest (endpoint: string): Promise<Object> {
    let r = new Request(
      `${window.galaHostname || ''}/${window.i18n.locale}/${endpoint}.json`,
      { credentials: 'same-origin' },
    )
    return fetch(r).then(response => response.json())
  }

  static graft (endpoint: string, params: Object): Promise<Object> {
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
  static espalier (endpoint: string, params: ?Object): Promise<Object> {
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
    return fetch(r).then(response => response.json())
  }

  static prune (endpoint: string): Promise<Response> {
    let r = new Request(`/${endpoint}.json`, {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: new Headers({ Accept: 'application/json' }),
    })
    return fetch(r)
  }

  static _handleResponse (response: Response): Promise<Object> {
    if (response.ok) {
      return response.json()
    } else if (response.bodyUsed) {
      return response.json().then((r: Object) => {
        const errorMessagePairs = Object.entries(r)

        const errorMessages = errorMessagePairs
          .reduce(
            (all, fieldErrs) => {
              const [field, errors] = fieldErrs

              if (errors != null && Array.isArray(errors)) {
                return [
                  ...all,
                  ...errors.map(
                    err =>
                      `${field} ${typeof err === 'string' ? err : 'error'}`,
                  ),
                ]
              }

              return [...all, `${field}: error`]
            },
            [],
          )
          .join('\n')

        throw Error(errorMessages)
      })
    } else {
      throw Error(`${response.status} ${response.statusText}`)
    }
  }
}
