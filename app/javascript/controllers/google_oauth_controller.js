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
    const email = this.emailTarget.value.trim()

    if (!email) {
      this.emailTarget.setCustomValidity(
        'Enter your email before continuing with Google.'
      )
      this.emailTarget.reportValidity()
      this.emailTarget.focus()
      return
    }

    this.emailTarget.setCustomValidity('')
    window.location.assign(
      buildGoogleOauthUrl(event.currentTarget.href, email)
    )
  }
}
