export var orchard = (path) => {
  let r = new Request(
    `/${path}.json`, {
      credentials: 'same-origin',
      headers: new Headers({
        'Accept-Language': window.i18n.locale
      })
    }
  )
  return fetch(r).
    then( (response) => { return response.json() } )
}

export var updateOrchard = (path, params) => {
  let body = JSON.stringify(params)
  let r = new Request(
    `/${path}.json`, {
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
