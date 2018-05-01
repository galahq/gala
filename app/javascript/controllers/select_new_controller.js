/**
 * @noflow
 */

import { Controller } from 'stimulus'

const VISIBLE_CLASS = 'new-group--visible'

export default class extends Controller {
  static targets = ['form', 'input']

  toggleFormVisibility (e) {
    if (selectedOptionIsNew(e)) {
      this.formTarget.classList.add(VISIBLE_CLASS)
      this.inputTargets.forEach(t => (t.disabled = false))
    } else {
      this.formTarget.classList.remove(VISIBLE_CLASS)
      this.inputTargets.forEach(t => (t.disabled = true))
    }
  }
}

function selectedOptionIsNew (e) {
  return !!e.target.selectedOptions.item(0).dataset.new
}
