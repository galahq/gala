import 'shims/installProcess'

import Rails from '@rails/ujs'
import * as ActionCable from '@rails/actioncable'
import * as ActiveStorage from 'activestorage'
import ahoy from 'ahoy.js'

import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'

import 'shared/blueprint'
import 'shared/blueprintLegacyNamespace'
import 'shared/galaTypography'
import 'controllers'

import { FocusStyleManager } from '@blueprintjs/core'
import SpotlightManager from 'shared/spotlight/SpotlightManager'
import { initPosthogAnalytics, identifyReader } from 'shared/analytics'
import html from 'shared/html'
import loadMessages from '../../config/locales'
import { startRailsRouteRouter } from 'router'

const locale = window.i18n?.locale || 'en'

function startRailsUjs () {
  window.Rails = Rails

  if (window.__galaRailsUjsStarted) return

  Rails.start()
  window.__galaRailsUjsStarted = true
}

function startAhoy () {
  window.ahoy = ahoy
}

function startActionCable () {
  window.ActionCable = ActionCable
  window.App = window.App || {}

  if (!('WebSocket' in window) || window.App.cable) return

  window.App.cable = ActionCable.createConsumer()
}

function startDevelopmentLiveReload () {
  if (typeof __GALA_NODE_ENV__ === 'undefined' || __GALA_NODE_ENV__ !== 'development') return
  if (!window.App?.cable || window.__galaDevelopmentLiveReloadStarted) return

  window.App.cable.subscriptions.create(
    { channel: 'DevelopmentLiveReloadChannel' },
    {
      received (message) {
        if (message?.type !== 'reload') return

        window.location.reload()
      },
    }
  )

  window.__galaDevelopmentLiveReloadStarted = true
}

function startOnboarding () {
  let unacknowledgedSpotlights = []

  if (window.reader) {
    unacknowledgedSpotlights = window.reader.unacknowledgedSpotlights
  }

  window.spotlightManager = new SpotlightManager(unacknowledgedSpotlights, {
    enabled: false,
  })

  window.addEventListener('load', () => {
    window.setInterval(() => {
      window.spotlightManager.enabled = true
    }, 1000)
  })

  if (initPosthogAnalytics() && window.reader) {
    identifyReader(window.reader)
  }
}

function filenameFromPath (value) {
  return value
    .split('\\')
    .pop()
    .split('/')
    .pop()
}

function startFileUploads () {
  if (window.__galaActiveStorageStarted) return

  document.querySelectorAll('.pt-file-input, .bp6-file-input').forEach(fileInput => {
    const hiddenInput = fileInput.querySelector('input[type=file]')
    const displayElement = fileInput.querySelector('.pt-file-upload-input, .bp6-file-upload-input')
    if (hiddenInput == null || displayElement == null) return

    hiddenInput.addEventListener('change', e => {
      if (!(e.currentTarget instanceof HTMLInputElement)) return
      displayElement.innerText = filenameFromPath(e.currentTarget.value)
    })
  })

  ActiveStorage.start()

  addEventListener('direct-upload:initialize', ({ target, detail }) => {
    const { id, file } = detail
    target.insertAdjacentHTML(
      'beforebegin',
      html`
        <div>
          Uploading ${file.name}...
          <div class="pt-progress-bar bp6-progress-bar pt-intent-primary bp6-intent-primary">
            <div
              id="direct-upload-progress-${id}"
              class="pt-progress-meter bp6-progress-meter"
              style="width: 0%"
            />
          </div>
        </div>
      `
    )
  })

  addEventListener('direct-upload:progress', ({ detail }) => {
    const { id, progress } = detail
    const progressBar = document.getElementById(`direct-upload-progress-${id}`)
    if (progressBar == null) return
    progressBar.style.width = `${progress}%`
  })

  addEventListener('direct-upload:end', ({ detail }) => {
    const { id } = detail
    const progressBar = document.getElementById(`direct-upload-progress-${id}`)
    if (progressBar == null) return

    progressBar.style.width = '100%'
    progressBar.classList.add('pt-no-animation', 'bp6-no-animation')
  })

  window.__galaActiveStorageStarted = true
}

FocusStyleManager.onlyShowFocusOnTabs()
startRailsUjs()
startAhoy()
startActionCable()
startDevelopmentLiveReload()
startOnboarding()
startFileUploads()
startRailsRouteRouter({ locale, loadMessages })
