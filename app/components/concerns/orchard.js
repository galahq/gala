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
      then( (response) => { return response.json() } )
  }

  static graft(endpoint, params) {}

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
      then( (response) => { return response.json() } )
  }

  static prune() {}

}
