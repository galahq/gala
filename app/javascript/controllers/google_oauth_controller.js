import { Controller } from 'stimulus'

export function buildGoogleOauthUrl (authorizationHref, email) {
  const destination = new URL(authorizationHref)
  const normalizedEmail = email.trim().toLowerCase()

  destination.search = ''
  if (normalizedEmail) {
    destination.searchParams.set('reader_email', normalizedEmail)
  }

  return destination.toString()
}

export default class extends Controller {
  static targets = ['email']

  authorize (event) {
    event.preventDefault()
    window.location.assign(
      buildGoogleOauthUrl(event.currentTarget.href, this.emailTarget.value)
    )
  }
}
