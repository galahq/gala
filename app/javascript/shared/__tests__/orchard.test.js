/* @noflow */

import { handleResponse, OrchardError, OrchardInputError } from '../orchard'

describe('Orchard (API service)', () => {
  describe('handleResponse', () => {
    it('resolves parsed JSON from a successful JSON res', async () => {
      const obj = { id: 1 }
      const body = JSON.stringify(obj)
      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
      })
      const res = new Response([body], { status: 200, headers })

      await expect(handleResponse(res)).resolves.toEqual(obj)
    })

    it('resolves text contents of a non-JSON res', async () => {
      const text = '<html><body>Success</body></html>'
      const headers = new Headers({ 'Content-Type': 'text/plain' })
      const res = new Response([text], { status: 200, headers })

      await expect(handleResponse(res)).resolves.toEqual(text)
    })

    it('resolves with no value from a successful res with no body', async () => {
      const res = new Response(null, { status: 204 })
      await expect(handleResponse(res)).resolves.toBeUndefined()
    })

    it('throws if a successful res has a malformed body', async () => {
      const body = '{ id: 1'
      const headers = new Headers({ 'Content-Type': 'application/json' })
      const res = new Response([body], { status: 200, headers })

      const error = await handleResponse(res).catch(x => x)

      expect(error).toBeInstanceOf(OrchardError)
      expect(error.message).toEqual('Malformed response')
    })

    it('rethrows the fetch error if the request fails', async () => {
      const res = new Response(null, { status: 404, statusText: 'Not Found' })

      const error = await handleResponse(res).catch(x => x)

      expect(error).toBeInstanceOf(OrchardError)
      expect(error.message).toEqual('404 Not Found')
    })

    it('throws with human readable error messages if res is 422', async () => {
      const errors = {
        email: ['can’t be blank'],
        password: [
          'must be at least 6 characters long',
          'must contain at least one number',
        ],
      }
      const body = JSON.stringify(errors)
      const headers = new Headers({ 'Content-Type': 'application/json' })
      const res = new Response([body], { status: 422, headers })

      const error = await handleResponse(res).catch(x => x)

      expect(error).toBeInstanceOf(OrchardInputError)
      expect(error.message).toEqual(
        'Email can’t be blank.\n' +
          'Password must be at least 6 characters long.\n' +
          'Password must contain at least one number.'
      )
    })
  })
})
