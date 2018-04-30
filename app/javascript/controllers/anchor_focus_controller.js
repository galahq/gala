/**
 * @noflow
 */

import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['container']

  connect () {
    if (location.hash === `#${this.element.id}`) {
      this.element.classList.add('anchor-focused')
    }
  }
}
