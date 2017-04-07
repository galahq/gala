import React from 'react'
import { connect } from 'react-redux'
import { convertToRaw } from 'draft-js'
import OldEdgenote from 'deprecated/OldEdgenote'
import { Edgenote } from 'edgenotes/Edgenote'

import typeof { EditorState } from 'draft-js'
import type { State } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (state: State, ownProps: OwnProps) {
  let edgenoteSlugs = getEdgenoteSlugs(state.cardsById[ownProps.cardId].editorState)
  return {
    oldStyle: edgenoteSlugs.some(x => state.edgenotesBySlug[x].style === 'v1'),
    edgenoteSlugs,
  }
}

const EdgenotesCard = ({edgenoteSlugs, oldStyle}) => {
  const AnEdgenote = oldStyle ? OldEdgenote : Edgenote

  if (edgenoteSlugs.length > 0) {
    return <aside
      className={oldStyle ? 'edgenotes' : 'c-edgenotes-card pt-dark'}>
      { edgenoteSlugs.map(
        (slug) => <AnEdgenote key={`${slug}`} slug={slug} />
      ) }
    </aside>
  } else {
    return null
  }
}

export default connect(mapStateToProps)(EdgenotesCard)

function getEdgenoteSlugs (editorState: EditorState): string[] {
  const rawContent = convertToRaw(editorState.getCurrentContent())
  return Object.values(rawContent.entityMap)
    .filter(entity => entity.type === 'EDGENOTE')
    .map(entity => entity.data.slug)
}
