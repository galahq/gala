/**
 * @providesModule TaggingsManager
 * 
 */

import { Orchard } from 'shared/orchard'

class TaggingsManager {
  taggingsPath

  constructor (taggingsPath) {
    this.taggingsPath = taggingsPath
  }

  add (tagName) {
    return Orchard.graft(this.taggingsPath, { tagging: { tagName }})
  }

  remove (tagName) {
    return Orchard.prune(`${this.taggingsPath}/${tagName}`)
  }
}

export default TaggingsManager
