/**
 * @noflow
 */

import { Controller } from 'stimulus'

const ACTIVE_CLASS = 'deployment--active'

export default class extends Controller {
  static targets = ['container']

  open () {
    this.containerTarget.classList.add(ACTIVE_CLASS)
  }

  close () {
    this.containerTarget.classList.remove(ACTIVE_CLASS)
  }
}
