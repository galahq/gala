/**
 * @noflow
 */

import { Controller } from 'stimulus'
import * as React from 'react'
import { render } from 'react-dom'
import ReadingListEditor from 'reading_list/ReadingListEditor'
import { Orchard } from 'shared/orchard'

export default class extends Controller {
  static targets = ['editor', 'saveButton', 'savedTag']

  get id () {
    return this.data.get('id')
  }

  connect () {
    render(<ReadingListEditor />, this.editorTarget)
  }

  disconnect () {
    this.editorTarget.innerHTML = ''
  }

  async save () {
    await Orchard.graft(`/reading_lists/${this.id}/save`)

    this.saveButtonTarget.classList.add('hidden')
    this.savedTagTarget.classList.remove('hidden')
  }
}
