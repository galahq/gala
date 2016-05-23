export var orchard = (path) => {
  let r = new Request(
    `http://localhost:3000/${path}`, {
      headers: new Headers({
        'Accept-Language': 'fr'
      })
    }
  )
  return fetch(r).
    then( (response) => { return response.json() } )
}
