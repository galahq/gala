/**
 *
 * Blueprint 6 uses the `bp6-` CSS namespace, but Gala still has hand-authored
 * `pt-*` and `bp4-*` class names in Ruby views, translations, and legacy React
 * code. Keep those classes intact for app-specific selectors while mirroring
 * them onto the current Blueprint namespace at runtime.
 */

const LEGACY_NAMESPACES = ['pt-', 'bp4-']
const BLUEPRINT_NAMESPACE = 'bp6-'

function mirrorLegacyClasses(node) {
  if (!(node instanceof Element)) return

  const blueprintClasses = Array.from(node.classList)
    .flatMap(className => {
      const legacyNamespace = LEGACY_NAMESPACES.find(namespace =>
        className.startsWith(namespace)
      )

      return legacyNamespace == null
        ? []
        : [className.replace(legacyNamespace, BLUEPRINT_NAMESPACE)]
    })
    .filter(className => !node.classList.contains(className))

  if (blueprintClasses.length > 0) node.classList.add(...blueprintClasses)
}

function mirrorLegacyClassesIn(root) {
  mirrorLegacyClasses(root)
  root
    .querySelectorAll('[class*="pt-"], [class*="bp4-"]')
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
