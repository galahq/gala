// Ahoy's JavaScript defaults to `cookies: true` and starts itself on document
// ready. Nothing in Gala calls ahoy.configure, so a visitor who has not
// consented has to be taken out of its way before that happens.
//
// This file is concatenated after `//= require ahoy` in application.js and
// runs from the head, which puts it after ahoy has defined itself and before
// DOMContentLoaded fires. app/views/layouts/application.html.erb sets the
// window.GALA_CONSENT it reads.
(function () {
  var consent = window.GALA_CONSENT || {}

  if (!consent.required || consent.granted) return
  if (!window.ahoy || typeof window.ahoy.configure !== 'function') return

  // startOnReady stops createVisit, which is what posts the visit to
  // /ahoy/visits. That POST is the thing to prevent: it writes the row
  // carrying visits.country. ahoy.js does also write ahoy_visit and
  // ahoy_visitor, but Ahoy.cookies = false has the server delete them on the
  // next request anyway. cookies: false additionally stops ahoy_events, which
  // ahoy.track would otherwise write from app/javascript/shared/analytics.js.
  window.ahoy.configure({ cookies: false, startOnReady: false })

  // Cheap insurance rather than cleanup. Since ae67f1a2 (May 2018) the server
  // has deleted these cookies on every request, so there is normally nothing
  // here to clear: ahoy.js writes them and the next request wipes them. The
  // call stays because it is correct if Ahoy.cookies is ever set back to true.
  if (typeof window.ahoy.reset === 'function') window.ahoy.reset()
})()
