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
const RAILS_RENDERED_LEGACY_SELECTOR = '.Toolbar__bar, .window-admin'

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

function firstApplicationStylesheet() {
  return Array.from(document.querySelectorAll('link[rel~="stylesheet"]')).find(
    link => {
      const href = link.getAttribute('href') || ''
      return (
        href.includes('/assets/') ||
        href.includes('/stylesheets/') ||
        /application(?:-[a-f0-9]+)?\\.css/.test(href)
      )
    }
  )
}

function installLegacyNamespaceStyle() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.appendChild(document.createTextNode(legacyNamespaceCss()))

  // Shakapacker emits pack scripts with defer, so appending this bridge at
  // runtime places Blueprint's generated `.pt-*` rules after Sprockets'
  // application.css. Main loaded Blueprint before application.css, allowing
  // Gala's Rails-rendered Sprockets styles (toolbar, admin buttons, forms) to
  // win. Preserve that cascade by inserting the bridge before application.css.
  const applicationStylesheet = firstApplicationStylesheet()
  if (applicationStylesheet && applicationStylesheet.parentNode) {
    applicationStylesheet.parentNode.insertBefore(style, applicationStylesheet)
  } else {
    document.head.appendChild(style)
  }
}

installLegacyNamespaceStyle()

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
