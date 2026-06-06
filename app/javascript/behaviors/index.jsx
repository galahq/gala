import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import loadMessages from '../../../config/locales'
import StatsPage from 'stats/StatsPage'
import ReadingListEditor from 'reading_list/ReadingListEditor'
import Identicon from 'shared/Identicon'
import Spotlight from 'shared/spotlight'
import { Orchard } from 'shared/orchard'
import ErrorBoundary from 'utility/ErrorBoundary'
import mergeRefs from 'utility/mergeRefs'

const VISIBLE_GROUP_CLASS = 'new-group--visible'
const ACTIVE_DEPLOYMENT_CLASS = 'deployment--active'
const bootedControllers = new WeakMap()

function ready (callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true })
  } else {
    callback()
  }
}

function controllerElements (name) {
  return Array.from(document.querySelectorAll('[data-gala-controller]'))
    .filter(element => (element.dataset.galaController || '').split(/\s+/).includes(name))
}

function markBooted (element, name) {
  const booted = bootedControllers.get(element) || new Set()
  if (booted.has(name)) return false

  booted.add(name)
  bootedControllers.set(element, booted)
  return true
}

function targetSelector (controller, target) {
  return `[data-gala-target~="${controller}.${target}"]`
}

function findTarget (scope, controller, target) {
  return scope.matches(targetSelector(controller, target))
    ? scope
    : scope.querySelector(targetSelector(controller, target))
}

function findTargets (scope, controller, target) {
  const selector = targetSelector(controller, target)
  return [
    ...(scope.matches(selector) ? [scope] : []),
    ...scope.querySelectorAll(selector),
  ]
}

function actionElements (scope) {
  return [
    ...(scope.hasAttribute('data-gala-action') ? [scope] : []),
    ...scope.querySelectorAll('[data-gala-action]'),
  ]
}

function bindAction (scope, controller, action, handler) {
  actionElements(scope).forEach(element => {
    const tokens = (element.dataset.galaAction || '').split(/\s+/).filter(Boolean)

    tokens.forEach(token => {
      const [eventName, target] = token.includes('->')
        ? token.split('->')
        : ['click', token]

      if (target !== `${controller}#${action}`) return
      element.addEventListener(eventName, event => handler(event, element))
    })
  })
}

function bootAnchorFocus () {
  controllerElements('anchor-focus').forEach(element => {
    if (!markBooted(element, 'anchor-focus')) return
    if (location.hash === `#${element.id}`) element.classList.add('anchor-focused')
  })
}

function bootClipboard () {
  controllerElements('clipboard').forEach(element => {
    if (!markBooted(element, 'clipboard')) return

    bindAction(element, 'clipboard', 'copy', () => {
      const source = findTarget(element, 'clipboard', 'source')
      if (!source) return

      source.select()
      document.execCommand('copy')
    })
  })
}

function bootConfirmation () {
  controllerElements('confirmation').forEach(element => {
    if (!markBooted(element, 'confirmation')) return

    bindAction(element, 'confirmation', 'check', event => {
      const submit = findTarget(element, 'confirmation', 'submit')
      if (!submit || !event.target) return

      const expected = (event.target.dataset.expected || '').toLowerCase()
      submit.disabled = event.target.value.toLowerCase() !== expected
    })
  })
}

function bootSelectNew () {
  controllerElements('select-new').forEach(element => {
    if (!markBooted(element, 'select-new')) return

    bindAction(element, 'select-new', 'toggleFormVisibility', event => {
      const selected = event.target.selectedOptions?.item(0)
      const form = findTarget(element, 'select-new', 'form')
      const inputs = findTargets(element, 'select-new', 'input')

      if (selected?.dataset.new) {
        form?.classList.add(VISIBLE_GROUP_CLASS)
        inputs.forEach(input => { input.disabled = false })
      } else {
        form?.classList.remove(VISIBLE_GROUP_CLASS)
        inputs.forEach(input => { input.disabled = true })
      }
    })
  })
}

function bootInviteDrawers () {
  const controller = 'deployments--invite-drawer'

  controllerElements(controller).forEach(element => {
    if (!markBooted(element, controller)) return

    bindAction(element, controller, 'open', () => {
      findTarget(element, controller, 'container')?.classList.add(ACTIVE_DEPLOYMENT_CLASS)
    })
    bindAction(element, controller, 'close', () => {
      findTarget(element, controller, 'container')?.classList.remove(ACTIVE_DEPLOYMENT_CLASS)
    })
  })
}

function bootSlugSettings () {
  const controller = 'cases--settings--slug'

  controllerElements(controller).forEach(element => {
    if (!markBooted(element, controller)) return

    const update = () => {
      const input = findTarget(element, controller, 'input')
      const preview = findTarget(element, controller, 'preview')
      const formGroup = findTarget(element, controller, 'formGroup')
      const submit = findTarget(element, controller, 'submit')
      if (!input || !preview || !formGroup || !submit) return

      preview.innerText = input.value

      if (input.value.match(/^[-a-z\d]{1,100}$/)) {
        formGroup.classList.remove('pt-intent-danger')
        submit.disabled = false
      } else {
        formGroup.classList.add('pt-intent-danger')
        submit.disabled = true
      }
    }

    bindAction(element, controller, 'update', update)
  })
}

function bootIdenticons () {
  controllerElements('identicon').forEach(element => {
    if (!markBooted(element, 'identicon')) return

    const reader = JSON.parse(element.dataset.identiconReader)
    createRoot(element).render(<Identicon presentational reader={reader} />)
  })
}

function bootCaseStats () {
  controllerElements('case-stats').forEach(element => {
    if (!markBooted(element, 'case-stats')) return

    const { url: dataUrl, caseId, minDate } = element.dataset
    const locale = window.i18n?.locale || 'en'
    let subscription = null

    if (caseId && window.App?.cable) {
      subscription = window.App.cable.subscriptions.create(
        { channel: 'StatsChannel', case_id: caseId },
        {
          received: async data => {
            if (data.type !== 'stats_updated') return

            const overviewElement = document.getElementById('stats-overview')
            if (!overviewElement) return

            try {
              const response = await fetch(`${dataUrl}/overview`, {
                headers: { Accept: 'text/html' },
                credentials: 'include',
              })
              if (response.ok) overviewElement.innerHTML = await response.text()
            } catch (error) {
              console.error('Failed to refresh stats overview:', error)
            }
          },
        }
      )
    }

    loadMessages(locale)
      .then(messages => {
        const root = createRoot(element)
        root.render(
          <ErrorBoundary>
            <IntlProvider locale={locale} messages={messages}>
              <StatsPage dataUrl={dataUrl} minDate={minDate} />
            </IntlProvider>
          </ErrorBoundary>
        )
      })
      .catch(error => {
        subscription?.unsubscribe()
        console.error('Failed to mount StatsPage:', error)
      })
  })
}

function bootReadingLists () {
  controllerElements('reading-list').forEach(element => {
    if (!markBooted(element, 'reading-list')) return

    const locale = window.i18n?.locale || 'en'
    const id = element.dataset.readingListId
    const editor = findTarget(element, 'reading-list', 'editor')

    if (editor) {
      loadMessages(locale).then(messages => {
        createRoot(editor).render(
          <ErrorBoundary>
            <IntlProvider locale={locale} messages={messages}>
              <ReadingListEditor initialItems={JSON.parse(element.dataset.readingListItems)} />
            </IntlProvider>
          </ErrorBoundary>
        )
      })
    }

    bindAction(element, 'reading-list', 'save', async () => {
      await Orchard.graft(`/reading_lists/${id}/save`)
      findTarget(element, 'reading-list', 'saveButton')?.classList.add('hidden')
      findTarget(element, 'reading-list', 'savedTag')?.classList.remove('hidden')
    })

    bindAction(element, 'reading-list', 'unsave', async () => {
      await Orchard.prune(`/reading_lists/${id}/save`)
      findTarget(element, 'reading-list', 'saveButton')?.classList.remove('hidden')
      findTarget(element, 'reading-list', 'savedTag')?.classList.add('hidden')
    })
  })
}

function bootReadingListItems () {
  controllerElements('reading-list-item').forEach(element => {
    if (!markBooted(element, 'reading-list-item')) return

    bindAction(element, 'reading-list-item', 'enroll', async () => {
      await Orchard.graft(`cases/${element.dataset.readingListItemCaseSlug}/enrollment`, {})
      findTarget(element, 'reading-list-item', 'enrollButton')?.classList.add('hidden')
      findTarget(element, 'reading-list-item', 'enrolledTag')?.classList.remove('hidden')
    })
  })
}

function ThievingSpotlight ({ children, content, placement, spotlightKey }) {
  const targetRef = React.useRef()

  React.useEffect(() => {
    if (targetRef.current) targetRef.current.appendChild(...children)
  })

  return (
    <Spotlight content={content} placement={placement} spotlightKey={spotlightKey}>
      {({ ref }) => (
        <span
          ref={mergeRefs(ref, targetRef)}
          dangerouslySetInnerHTML={{ __html: '' }}
        />
      )}
    </Spotlight>
  )
}

function bootSpotlights () {
  controllerElements('spotlight').forEach(element => {
    if (!markBooted(element, 'spotlight')) return

    const children = [...element.children]
    createRoot(element).render(
      <ThievingSpotlight
        content={element.dataset.spotlightContent}
        placement={element.dataset.spotlightPlacement || undefined}
        spotlightKey={element.dataset.spotlightKey}
      >
        {children}
      </ThievingSpotlight>
    )
  })
}

ready(() => {
  bootAnchorFocus()
  bootClipboard()
  bootConfirmation()
  bootSelectNew()
  bootInviteDrawers()
  bootSlugSettings()
  bootIdenticons()
  bootCaseStats()
  bootReadingLists()
  bootReadingListItems()
  bootSpotlights()
})
