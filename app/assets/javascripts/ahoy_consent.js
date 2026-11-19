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

  // startOnReady stops createVisit, which is what writes ahoy_visit (4 hours)
  // and ahoy_visitor (2 years). cookies also stops ahoy_events, which
  // ahoy.track would otherwise write from app/javascript/shared/analytics.js.
  window.ahoy.configure({ cookies: false, startOnReady: false })

  // Stopping new cookies is not enough on its own. Every visitor in scope who
  // was here before this shipped already holds an ahoy_visit and a two-year
  // ahoy_visitor written without being asked, and someone who simply ignores
  // the banner would keep them. Clear them on sight.
  if (typeof window.ahoy.reset === 'function') window.ahoy.reset()
})()
