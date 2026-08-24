/**
 * 
 */

import { EditorState, Modifier, getDefaultKeyBinding } from 'draft-js'

export function getSelectionText (editorState) {
  const selection = editorState.getSelection()
  const start = selection.getStartOffset()
  const end = selection.getEndOffset()

  const blocks = editorState.getCurrentContent().getBlocksAsArray()
  const blockKey = selection.getStartKey()
  const blockIndex = blocks.findIndex(b => b.getKey() === blockKey)

  return blocks[blockIndex].getText().slice(start, end)
}

export function getParagraphs (editorState) {
  return editorState
    .getCurrentContent()
    .getBlockMap()
    .map(block => block.getText())
    .toArray()
}

const getPrecedingCharacter = (editorState) => (
  n
) => {
  debugger
  const selection = editorState.getSelection()
  const content = editorState.getCurrentContent()
  const block = content.getBlockForKey(selection.getStartKey())
  const cursorOffset = selection.getStartOffset()
  return block.getText().slice(cursorOffset - n, cursorOffset)
}

const addCharacterAtSelection = (editorState) => (
  text,
  { replacing } = { replacing: 0 }
) => {
  const contentState = editorState.getCurrentContent()
  const targetRange = editorState
    .getSelection()
    .update('anchorOffset', offset => offset - replacing)
  const newContentState = Modifier.replaceText(contentState, targetRange, text)
  return EditorState.push(editorState, newContentState, 'insert-characters')
}

export function applySmartTypography (
  chars,
  editorState
) {
  const preceding = getPrecedingCharacter(editorState)

  const insert = addCharacterAtSelection(editorState)

  switch (chars) {
    case "'":
      if (preceding(1).match(/^[ “]?$/)) return insert('‘')
      return insert('’')
    case '"':
      if (preceding(1).match(/^[ ‘]?$/)) return insert('“')
      return insert('”')
    case '-':
      if (preceding(1).match(/[-–]/)) return insert('—', { replacing: 1 })
      if (preceding(1).match(/[\d\s]/)) return insert('–')
      break
    case '.':
      if (preceding(2) === '..') return insert('…', { replacing: 2 })
  }
}

const GALA_KEYBINDING_SOFT_NEWLINE = 'gala-keybinding-soft-newline'

export function keyBindingFn (e) {
  if (e.key === 'Enter' && e.shiftKey) {
    return GALA_KEYBINDING_SOFT_NEWLINE
  }

  return getDefaultKeyBinding(e)
}

export function handleCustomKeyBindings (
  editorState,
  command
) {
  switch (command) {
    case GALA_KEYBINDING_SOFT_NEWLINE:
      return addCharacterAtSelection(editorState)('\n')
  }
}
