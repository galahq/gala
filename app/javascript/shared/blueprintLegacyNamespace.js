/**
 * @noflow
 *
 * Blueprint 4 changed the generated CSS namespace from `pt-` to `bp4-`, but
 * Gala still has many hand-authored legacy `pt-*` class names. The actual
 * Blueprint package CSS is loaded by Sprockets `application.css`; this file
 * only mirrors legacy classes onto runtime DOM nodes so those elements
 * receive the BP4 styles. Gala's JS-pack overrides stay in
 * `shared/blueprint.scss`, so this bridge avoids a second raw-loader copy of
 * Blueprint's CSS.
 */

const LEGACY_NAMESPACE = 'pt-'
const BLUEPRINT_NAMESPACE = 'bp4-'
const RAILS_RENDERED_LEGACY_SELECTOR = '.Toolbar__bar, .window-admin, .window.admin'

function isRailsRenderedLegacyElement(node) {
  return (
    node instanceof Element &&
    node.closest(RAILS_RENDERED_LEGACY_SELECTOR) != null
  )
}

function mirrorLegacyClasses(node) {
  if (!(node instanceof Element)) return
  if (isRailsRenderedLegacyElement(node)) return

  const blueprintClasses = Array.from(node.classList)
    .filter(className => className.startsWith(LEGACY_NAMESPACE))
    .map(className =>
      className.replace(LEGACY_NAMESPACE, BLUEPRINT_NAMESPACE)
    )
    .filter(className => !node.classList.contains(className))

  if (blueprintClasses.length > 0) node.classList.add(...blueprintClasses)
}

function mirrorLegacyClassesIn(root) {
  mirrorLegacyClasses(root)
  root
    .querySelectorAll('[class*="pt-"]')
    .forEach(element => mirrorLegacyClasses(element))
}

function observeLegacyClassChanges() {
  const Observer =
    typeof MutationObserver !== 'undefined'
      ? MutationObserver
      : typeof window !== 'undefined'
        ? window.MutationObserver
        : undefined

  if (typeof Observer === 'undefined') return

  const observer = new Observer(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        mirrorLegacyClasses(mutation.target)
        return
      }

      mutation.addedNodes.forEach(node => {
        if (node instanceof Element) mirrorLegacyClassesIn(node)
      })
    })
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true,
  })
}

function startLegacyClassBridge() {
  mirrorLegacyClassesIn(document.body)
  observeLegacyClassChanges()
}

if (typeof document !== 'undefined') {
  if (document.body) {
    startLegacyClassBridge()
  } else {
    document.addEventListener('DOMContentLoaded', startLegacyClassBridge, {
      once: true,
    })
  }
}
