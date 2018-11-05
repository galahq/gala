/**
 * @noflow
 */

import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['submit']

  check (e) {
    if (valueMatchesExpected(e.target)) this.submitTarget.disabled = false
    else this.submitTarget.disabled = true
  }
}

function valueMatchesExpected (input) {
  return input.value.toLowerCase() === input.dataset.expected.toLowerCase()
}
