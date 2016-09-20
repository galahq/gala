export class Orchard {

  static harvest(endpoint) {
    let r = new Request(
      `/${endpoint}.json`, {
        credentials: 'same-origin',
        headers: new Headers({
          'Accept-Language': window.i18n.locale
        })
      }
    )
    return fetch(r).
      then((response) => (response.json()))
  }

  static graft(endpoint, params) {
    let body = JSON.stringify(params)
    let r = new Request(
      `/${endpoint}.json`, {
        credentials: 'same-origin',
        method: 'POST',
        body: body,
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': window.i18n.locale
        })
      }
    )
    return fetch(r).
      then( (response) => (response.json()) )
  }

  static espalier(endpoint, params) {  // Train a fruit tree to grow into a desired figure.
    let body = JSON.stringify(params)
    let r = new Request(
      `/${endpoint}.json`, {
        credentials: 'same-origin',
        method: 'PUT',
        body: body,
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': window.i18n.locale
        })
      }
    )
    return fetch(r).
      then((response) => (response.json()))
  }

  static prune(endpoint) {
    let r = new Request(
      `/${endpoint}.json`, {
        credentials: 'same-origin',
        method: 'DELETE',
        headers: new Headers({
          'Accept': 'application/json'
        })
      }
    )
    return fetch(r).
      then((response) => (response.json()))
  }

}
