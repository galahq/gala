/**
 * @noflow
 */

import { Controller } from 'stimulus'
import { Orchard } from 'shared/orchard'

export default class extends Controller {
  static targets = ['saveButton', 'savedTag']

  get id () {
    return this.data.get('id')
  }

  async save () {
    await Orchard.graft(`/reading_lists/${this.id}/save`)

    this.saveButtonTarget.classList.add('hidden')
    this.savedTagTarget.classList.remove('hidden')
  }
}
