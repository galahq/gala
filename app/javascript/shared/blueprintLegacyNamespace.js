/**
 * @noflow
 */

import blueprintCoreCss from '!!raw-loader!@blueprintjs/core/lib/css/blueprint.css'
import blueprintDatetimeCss from '!!raw-loader!@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import blueprintPopoverCss from '!!raw-loader!@blueprintjs/popover2/lib/css/blueprint-popover2.css'
import blueprintSelectCss from '!!raw-loader!@blueprintjs/select/lib/css/blueprint-select.css'

const STYLE_ID = 'blueprint-legacy-pt-namespace'
const LEGACY_NAMESPACE = 'pt-'
const BLUEPRINT_NAMESPACE = 'bp4-'

function cssText(module) {
  return typeof module === 'string' ? module : module.default
}

function legacyNamespaceCss() {
  return [
    blueprintCoreCss,
    blueprintDatetimeCss,
    blueprintPopoverCss,
    blueprintSelectCss,
  ]
    .map(cssText)
    .join('\n\n')
    .replace(/bp4/g, 'pt')
}

if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.appendChild(document.createTextNode(legacyNamespaceCss()))
  document.head.appendChild(style)
}

function mirrorLegacyClasses(node) {
  if (!(node instanceof Element)) return

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
  if (typeof MutationObserver === 'undefined') return

  const observer = new MutationObserver(mutations => {
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
