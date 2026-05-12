/**
 * This component extracts the edgenote slugs from a Card’s DraftEntities.
 *
 * Edgenotes exist in the old `v1` style, which looks too much like a textbook,
 * and `v2` style that is clean and compelling. Multiple Edgenotes can be
 * attached to one card, in which case they appear in order of their highlight
 * strings in a grid maximum 2 Edgenotes wide.
 *
 * @providesModule EdgenotesCard
 * 
 */

import React from 'react'
import { connect } from 'react-redux'
import { values } from 'ramda'

import { EditorState, convertToRaw } from 'draft-js'
import OldEdgenote from 'deprecated/OldEdgenote'
import Edgenote from 'edgenotes/Edgenote'


function mapStateToProps (state, ownProps) {
  let edgenoteSlugs = getEdgenoteSlugs(
      state.cardsById[ownProps.cardId].editorState || EditorState.createEmpty()
  )
  try {
    return {
      oldStyle: edgenoteSlugs.some(x => state.edgenotesBySlug[x].style === 'v1'),
      edgenoteSlugs,
    }
  } catch (error) {
    return {
      oldStyle: false,
      edgenoteSlugs,
    }
  }
}

const EdgenotesCard = ({ edgenoteSlugs, oldStyle }) => {
  if (edgenoteSlugs.length === 0) return null

  const AnEdgenote = oldStyle ? OldEdgenote : Edgenote

  return (
    <>
      {edgenoteSlugs.map((slug, i) => (
        <AnEdgenote key={slug} slug={slug} i={i} />
      ))}
    </>
  )
}

export default connect(
  mapStateToProps,
  () => ({})
)(EdgenotesCard)

export function getEdgenoteSlugs (editorState) {
  const rawContent = convertToRaw(editorState.getCurrentContent())
  return values(rawContent.entityMap)
    .filter(({ type }) => type === 'EDGENOTE')
    .map(({ data }) => (data ? data.slug : ''))
    .filter(x => !!x)
}
