/**
 * 
 */

import { Controller } from 'stimulus'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { addLocaleData, IntlProvider } from 'react-intl'

import ReadingListEditor from 'reading_list/ReadingListEditor'
import ErrorBoundary from 'utility/ErrorBoundary'
import { Orchard } from 'shared/orchard'

import loadMessages from '../../../config/locales'

const { locale } = (window.i18n)

export default class extends Controller {
  static targets = ['editor', 'saveButton', 'savedTag']

  get id () {
    return this.data.get('id')
  }

  get items () {
    return JSON.parse(this.data.get('items'))
  }

  async connect () {
    if (!this.hasEditorTarget) return

    const messages = await this._loadIntlData()

    this.root = createRoot(this.editorTarget)
    this.root.render(
      <ErrorBoundary>
        <IntlProvider locale={locale} messages={messages}>
          <ReadingListEditor initialItems={this.items} />
        </IntlProvider>
      </ErrorBoundary>
    )
  }

  disconnect () {
    if (!this.hasEditorTarget) return

    this.root?.unmount()
  }

  async save () {
    await Orchard.graft(`/reading_lists/${this.id}/save`)

    this.saveButtonTarget.classList.add('hidden')
    this.savedTagTarget.classList.remove('hidden')
  }

  async unsave () {
    await Orchard.prune(`/reading_lists/${this.id}/save`)

    this.saveButtonTarget.classList.remove('hidden')
    this.savedTagTarget.classList.add('hidden')
  }

  async _loadIntlData () {
    const intlData = [
      import(`react-intl/locale-data/${locale.substring(0, 2)}`),
      loadMessages(locale),
    ]
    const [localeData, messages] = await Promise.all(intlData)

    addLocaleData(localeData.default)

    return messages
  }
}
