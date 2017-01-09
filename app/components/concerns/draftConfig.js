import {
  CompositeDecorator,
  DefaultDraftBlockRenderMap,
  RichUtils,
  Modifier,
  EditorState,
} from 'draft-js'
import Immutable from 'immutable'

import EdgenoteEntity from 'EdgenoteEntity.js'
import CitationEntity from 'CitationEntity.js'

const newBlockRenderMap = Immutable.Map({
  'unstyled': {
    element: 'p',
  },
})
export const blockRenderMap = DefaultDraftBlockRenderMap.merge(newBlockRenderMap)

export const customStyleMap = {
  'BOLD': {
    fontWeight: 'inherit',
    letterSpacing: 1,
    fontVariant: 'small-caps',
  },
  'UNDERLINE': {},
  'SELECTION': {
    backgroundColor: '#ccc',
  },
}

function getFindEntityFunction(type) {
  return (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
            contentState.getEntity(entityKey).getType() === type
        )
      },
      callback
    )
  }
}

export const decorator = new CompositeDecorator([
  {
    strategy: getFindEntityFunction('EDGENOTE'),
    component: EdgenoteEntity,
  }, {
    strategy: getFindEntityFunction('CITATION'),
    component: CitationEntity,
  },
])

// We need the selection to remain visible while the user interacts with the
// edgenote creation popover, so we add an inline style of type "SELECTION",
// which gives a grey background.
export function addShadowSelection(editorState) {
  if (!editorState.getSelection().isCollapsed()) {
    return RichUtils.toggleInlineStyle(editorState, 'SELECTION')
  } else {
    return editorState
  }
}

export function removeShadowSelection(editorState) {
  if (editorState.getCurrentInlineStyle().has('SELECTION')) {
    return RichUtils.toggleInlineStyle(editorState, 'SELECTION')
  } else {
    return editorState
  }
}


export function addEntity(editorState, {type, mutability, data}) {
  const contentState = editorState.getCurrentContent()
  const contentStateWithEntity = contentState.createEntity(type, mutability, data)
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const contentStateWithEntityApplied = Modifier.applyEntity(contentStateWithEntity, editorState.getSelection(), entityKey)
  const editorStateWithEntity = EditorState.set(editorState, {currentContent: contentStateWithEntityApplied})
  return editorStateWithEntity
}
