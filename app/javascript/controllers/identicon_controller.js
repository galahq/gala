/**
 * @noflow
 */

import { Controller } from 'stimulus'
import * as React from 'react'
import { render } from 'react-dom'
import Identicon from 'shared/Identicon'

export default class extends Controller {
  get reader () {
    return JSON.parse(this.data.get('reader'))
  }

  connect () {
    render(<Identicon presentational reader={this.reader} />, this.element)
  }

  disconnect () {
    this.element.innerHTML = ''
  }
}
