/**
 * @providesModule EdgenotesCard
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { values } from 'ramda'

import { convertToRaw } from 'draft-js'
import OldEdgenote from 'deprecated/OldEdgenote'
import Edgenote from 'edgenotes/Edgenote'

import { EditorState } from 'draft-js'
import type { State } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (state: State, ownProps: OwnProps) {
  let edgenoteSlugs = getEdgenoteSlugs(
    state.cardsById[ownProps.cardId].editorState || EditorState.createEmpty()
  )
  return {
    oldStyle: edgenoteSlugs.some(x => state.edgenotesBySlug[x].style === 'v1'),
    edgenoteSlugs,
  }
}

const EdgenotesCard = ({ edgenoteSlugs, oldStyle }) => {
  const AnEdgenote = oldStyle ? OldEdgenote : Edgenote

  if (edgenoteSlugs.length > 0) {
    return (
      <aside className={oldStyle ? 'edgenotes' : 'c-edgenotes-card pt-dark'}>
        {edgenoteSlugs.map(slug => <AnEdgenote key={`${slug}`} slug={slug} />)}
      </aside>
    )
  } else {
    return null
  }
}

export default connect(mapStateToProps, () => {})(EdgenotesCard)

function getEdgenoteSlugs (editorState: EditorState): string[] {
  const rawContent = convertToRaw(editorState.getCurrentContent())
  return values(rawContent.entityMap)
    .filter(({ type }) => type === 'EDGENOTE')
    .map(({ data }) => (data ? data.slug : ''))
    .filter(x => !!x)
}
