/**
 * Helper functions for configuring Draft.js Editors
 *
 * @flow
 */

import { CompositeDecorator } from 'draft-js'

import EdgenoteEntity from './EdgenoteEntity'
import CitationEntity from './CitationEntity'
import LinkEntity from './LinkEntity'
import CommentThreadEntity from 'comments/CommentThreadEntity'
import MathEntity from './MathEntity'

export const styles = {
  smallCaps: {
    fontWeight: 'inherit',
    letterSpacing: 1,
    fontVariant: 'small-caps',
  },

  thinUnderline: {
    background: 'linear-gradient(rgba(115,81,212, 1),rgba(115,81,212, 1))',
    backgroundSize: '1px 1px',
    backgroundRepeat: 'repeat-x',
    backgroundPosition: '0 93%',
    textShadow:
      '0.03em 0 #EBEAE4, -0.03em 0 #EBEAE4, 0 0.03em #EBEAE4, 0 -0.03em #EBEAE4, 0.06em 0 #EBEAE4, -0.06em 0 #EBEAE4, 0.09em 0 #EBEAE4, -0.09em 0 #EBEAE4, 0.12em 0 #EBEAE4, -0.12em 0 #EBEAE4, 0.15em 0 #EBEAE4, -0.15em 0 #EBEAE4',
    cursor: 'pointer',
  },

  lightPurpleUnderline: {
    textShadow: 'none',
    boxShadow: 'inset 0 -0.35em 0 #9776F4',
    borderBottom: '1px solid #9776F4',
    cursor: 'pointer',
  },

  darkPurpleUnderline: {
    textShadow: 'none',
    boxShadow: 'inset 0 -0.35em 0 #7351D4',
    borderBottom: '1px solid #7351D4',
    cursor: 'pointer',
  },

  purpleHighlight: {
    backgroundColor: '#7351D4',
    borderBottom: '1px solid #493092',
    boxShadow: 'inset 0 -0.35em 0 #493092',
    textShadow: 'none',
    color: 'white',
  },
}

type StyleMapArgs = {
  commentable: boolean,
  theseCommentThreadsOpen: boolean,
  hoveredCommentThread: ?string,
  selectedCommentThread: ?string,
}
export function getStyleMap ({
  commentable,
  theseCommentThreadsOpen,
  hoveredCommentThread,
  selectedCommentThread,
}: StyleMapArgs) {
  const hoveredCommentKey = `thread--${hoveredCommentThread || 'null'}`
  const selectedCommentKey = `thread--${selectedCommentThread || 'null'}`
  const threadStyle = {
    THREAD: theseCommentThreadsOpen
      ? styles.lightPurpleUnderline
      : styles.thinUnderline,
  }

  return {
    BOLD: styles.smallCaps,
    UNDERLINE: {},
    ...(commentable ? threadStyle : {}),
    [hoveredCommentKey]: styles.darkPurpleUnderline,
    [selectedCommentKey]: styles.purpleHighlight,
  }
}

function getFindEntityFunction (type) {
  return (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity()
      return (
        entityKey != null &&
        contentState.getEntity(entityKey).getType() === type
      )
    }, callback)
  }
}

function findCommentThreadEntity (contentBlock, cb) {
  contentBlock.findStyleRanges(character => character.hasStyle('THREAD'), cb)
}

export const decorator = new CompositeDecorator([
  {
    strategy: getFindEntityFunction('EDGENOTE'),
    component: EdgenoteEntity,
  },
  {
    strategy: getFindEntityFunction('CITATION'),
    component: CitationEntity,
  },
  {
    strategy: findCommentThreadEntity,
    component: CommentThreadEntity,
  },
  {
    strategy: getFindEntityFunction('LINK'),
    component: LinkEntity,
  },
  {
    strategy: getFindEntityFunction('MATH'),
    component: MathEntity,
  },
])

export { keyBindingFn } from 'shared/draftHelpers'
