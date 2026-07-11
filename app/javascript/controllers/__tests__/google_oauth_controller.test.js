import GoogleOauthController, {
  buildGoogleOauthUrl,
} from '../google_oauth_controller'

const authorizationHref =
  'https://gala.example/authentication_strategies/auth/google'

if (typeof describe === 'function') {
  describe('buildGoogleOauthUrl', () => {
    test('normalizes the reader email with trim and lowercase', () => {
      expect(buildGoogleOauthUrl(authorizationHref, '  Reader@Example.COM  '))
        .toBe(`${authorizationHref}?reader_email=reader%40example.com`)
    })

    test('omits reader_email when the normalized email is blank', () => {
      expect(buildGoogleOauthUrl(authorizationHref, '   '))
        .toBe(authorizationHref)
    })

    test('preserves the fixed Google authorization path', () => {
      const result = new URL(
        buildGoogleOauthUrl(authorizationHref, 'reader@example.com')
      )

      expect(result.pathname).toBe('/authentication_strategies/auth/google')
    })
  })

  describe('GoogleOauthController', () => {
    test('requires an email before starting Google authorization', () => {
      document.body.innerHTML = `
        <form data-controller="google-oauth">
          <input data-target="google-oauth.email" value="   ">
          <a href="${authorizationHref}"
             data-action="click->google-oauth#authorize">Google</a>
        </form>
      `

      const originalAssign = window.location.assign
      window.location.assign = jest.fn()

      try {
        const emailTarget = document.querySelector(
          '[data-target="google-oauth.email"]'
        )
        emailTarget.reportValidity = jest.fn()
        emailTarget.focus = jest.fn()
        const event = {
          currentTarget: document.querySelector('a'),
          preventDefault: jest.fn(),
        }

        GoogleOauthController.prototype.authorize.call({ emailTarget }, event)

        expect(event.preventDefault).toHaveBeenCalled()
        expect(emailTarget.validationMessage).toBe(
          'Enter your email before continuing with Google.'
        )
        expect(emailTarget.reportValidity).toHaveBeenCalled()
        expect(emailTarget.focus).toHaveBeenCalled()
        expect(window.location.assign).not.toHaveBeenCalled()
      } finally {
        window.location.assign = originalAssign
      }
    })

    test('navigates with only the normalized email from its target', () => {
      document.body.innerHTML = `
        <form data-controller="google-oauth">
          <input data-target="google-oauth.email" value="  Reader@Example.COM  ">
          <input name="reader[password]" value="private-password">
          <input name="reader[password_confirmation]" value="private-confirmation">
          <input name="reader[name]" value="private-reader-name">
          <input name="reader[locale]" value="private-locale">
          <input name="future_field" value="private-future-value">
          <a href="${authorizationHref}"
             data-action="click->google-oauth#authorize">Google</a>
        </form>
      `

      const originalAssign = window.location.assign
      window.location.assign = jest.fn()

      try {
        const controller = {
          emailTarget: document.querySelector(
            '[data-target="google-oauth.email"]'
          ),
        }
        const event = {
          currentTarget: document.querySelector('a'),
          preventDefault: jest.fn(),
        }

        GoogleOauthController.prototype.authorize.call(controller, event)

        expect(event.preventDefault).toHaveBeenCalled()
        expect(window.location.assign).toHaveBeenCalledWith(
          `${authorizationHref}?reader_email=reader%40example.com`
        )
        const destination = new URL(window.location.assign.mock.calls[0][0])
        expect(Array.from(destination.searchParams.keys()))
          .toEqual(['reader_email'])
        const decodedDestination = decodeURIComponent(destination.href)
        const excludedValues = [
          'private-password',
          'private-confirmation',
          'private-reader-name',
          'private-locale',
          'private-future-value',
        ]
        excludedValues.forEach(value => {
          expect(decodedDestination).not.toContain(value)
        })
      } finally {
        window.location.assign = originalAssign
      }
    })
  })
}
