import {
  CompositeDecorator,
  DefaultDraftBlockRenderMap,
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
