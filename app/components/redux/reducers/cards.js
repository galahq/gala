import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'concerns/convertFromOldStyleCardSerialization.js'
import { addCommentThreads } from 'concerns/commentThreads.js'
import { decorator } from 'concerns/draftConfig.js'

import { UPDATE_CARD_CONTENTS } from '../actions.js'

function cardsById(state = getInitialState(), action) {
  switch (action.type) {
    case UPDATE_CARD_CONTENTS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          editorState: action.editorState,
        },
      }

    default: return state
  }
}

export default cardsById




function getInitialState() {
  let state = {...window.caseData.cards}

  Object.values(state).forEach( card => {

    const content = card.rawContent
      ? JSON.parse(card.rawContent)
      : convertFromOldStyleCardSerialization(card.content)

    const contentWithCommentThreads = addCommentThreads(content, card)

    const contentState = convertFromRaw(contentWithCommentThreads)

    state[card.id].editorState = EditorState.createWithContent(contentState,
                                                               decorator)
  } )

  return state
}
