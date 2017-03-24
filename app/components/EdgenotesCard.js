import React from 'react'
import { connect } from 'react-redux'
import { convertToRaw } from 'draft-js'
import OldEdgenote from 'OldEdgenote.js'
import {Edgenote} from 'Edgenote.js'

function mapStateToProps(state, ownProps) {
  let edgenoteSlugs = getEdgenoteSlugs(state.cardsById[ownProps.cardId].editorState)
  return {
    oldStyle: edgenoteSlugs.some( x => state.edgenotesBySlug[x].style === 'v1' ),
    edgenoteSlugs,
  }
}

const EdgenotesCard = ({edgenoteSlugs, oldStyle, caseSlug, selectedPage}) => {
  const AnEdgenote = oldStyle ? OldEdgenote : Edgenote

  if (edgenoteSlugs.length > 0) {
    return <aside
      className={oldStyle ? "edgenotes" : 'c-edgenotes-card pt-dark'}
      children={ edgenoteSlugs.map(
        (slug) => {
          return <AnEdgenote
            slug={slug}
            caseSlug={caseSlug}
            pathPrefix={`${selectedPage}`}
            key={`${slug}`}
            didSave={null}
          />
        })
      }
    />
  } else {
    return null
  }
}

export default connect(mapStateToProps)(EdgenotesCard)


function getEdgenoteSlugs(editorState) {
  const rawContent = convertToRaw(editorState.getCurrentContent())
  return Object.values(rawContent.entityMap)
    .filter( entity => entity.type === "EDGENOTE" )
    .map( entity => entity.data.slug )
}
