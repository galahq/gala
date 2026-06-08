/**
 * 
 */

import { Controller } from 'stimulus'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import Identicon from 'shared/Identicon'

export default class extends Controller {
  get reader () {
    return JSON.parse(this.data.get('reader'))
  }

  connect () {
    this.root = createRoot(this.element)
    this.root.render(<Identicon presentational reader={this.reader} />)
  }

  disconnect () {
    this.root?.unmount()
  }
}
