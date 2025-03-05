/**
 * @noflow
 */

import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['input', 'preview', 'formGroup', 'submit']

  update () {
    this.previewTarget.innerText = this.inputTarget.value
    this.validate()
  }

  validate () {
    const { classList } = this.formGroupTarget
    if (this.isValid()) {
      classList.remove('bp3-intent-danger')
      this.submitTarget.disabled = false
    } else {
      classList.add('bp3-intent-danger')
      this.submitTarget.disabled = true
    }
  }

  isValid () {
    return this.inputTarget.value.match(/^[-a-z\d]{1,100}$/)
  }
}
