/**
 *
 */

import { Controller } from 'stimulus'
import { Orchard } from 'shared/orchard'

export default class extends Controller {
  static targets = ['enrollButton', 'enrolledTag']

  connect () {
    this.element.dataset.readingListItemReady = 'true'
  }

  get caseSlug () {
    return this.data.get('caseSlug')
  }

  async enroll () {
    await Orchard.graft(`cases/${this.caseSlug}/enrollment`, {})

    this.enrollButtonTarget.classList.add('hidden')
    this.enrolledTagTarget.classList.remove('hidden')
  }
}
