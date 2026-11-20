/**
 * @providesModule consent
 *
 * Whether this visitor has allowed anything to be kept in their browser or
 * handed to a third party. app/views/layouts/application.html.erb renders the
 * window.GALA_CONSENT this reads, from the Consent controller concern.
 */

export const trackingAllowed = () => {
  const consent = window.GALA_CONSENT

  // A page with no flag is one rendered outside the application layout. The
  // only such HTML layout is print, which loads no JavaScript at all, so
  // there is nothing there to gate.
  if (!consent) return true

  return !consent.required || !!consent.granted
}
