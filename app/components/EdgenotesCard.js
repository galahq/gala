import React from 'react'
import OldEdgenote from 'OldEdgenote.js'
import {Edgenote} from 'Edgenote.js'
import mapNL from 'concerns/mapNL.js'

export class EdgenotesCard extends React.Component {

  edgenotes() {
    var contentsNode = document.createElement('div')
    contentsNode.innerHTML = this.props.card.content
    var aNodes = contentsNode.querySelectorAll('a[data-edgenote]')
    return mapNL(aNodes, (a) => {
      return a.getAttribute('data-edgenote')
    })
  }

  render() {
    let {edgenoteLibrary, caseSlug, selectedPage, selectedEdgenote, didSave } = this.props
    let edit = didSave !== null ? "/edit" : ""

    let edgenotes = this.edgenotes()
    let oldStyle = edgenotes.some(x => edgenoteLibrary[x].style === 'v1')
    const AnEdgenote = oldStyle ? OldEdgenote : Edgenote

    if (edgenotes.length > 0) {
      return <aside
        className={oldStyle ? "edgenotes" : 'c-edgenotes-card'}
        children={ edgenotes.map(
          (slug) => {
            return <AnEdgenote
              slug={slug}
              contents={edgenoteLibrary[slug]}
              caseSlug={caseSlug}
              pathPrefix={`${edit}/${selectedPage}`}
              selected={slug == selectedEdgenote}
              key={`${slug}`}
              didSave={didSave}
            />
          })
        }
      />
    } else {
      return null
    }
  }

}
