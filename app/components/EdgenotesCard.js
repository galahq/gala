import React from 'react'
import OldEdgenote from 'OldEdgenote.js'
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

    if (edgenotes.length > 0) {
      return <aside
        className="edgenotes"
        children={ edgenotes.map(
          (slug) => {
            return <OldEdgenote
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
