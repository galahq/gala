export var orchard = (path) => {
  let r = new Request(
    `/${path}.json`, {
      headers: new Headers({
        'Accept-Language': window.i18n.locale
      })
    }
  )
  return fetch(r).
    then( (response) => { return response.json() } )
}
