/**
 * @providesModule TaggingsManager
 * @flow
 */

import { Orchard } from 'shared/orchard'

class TaggingsManager {
  taggingsPath: string

  constructor (taggingsPath: string) {
    this.taggingsPath = taggingsPath
  }

  add (tagName: string) {
    return Orchard.graft(this.taggingsPath, { tagging: { tagName }})
  }

  remove (tagName: string) {
    return Orchard.prune(`${this.taggingsPath}/${tagName}`)
  }
}

export default TaggingsManager
