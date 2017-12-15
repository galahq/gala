/**
 * @flow
 */

import type { EditorState } from 'draft-js'

export function getSelectionText (editorState: EditorState): string {
  const selection = editorState.getSelection()
  const start = selection.getStartOffset()
  const end = selection.getEndOffset()

  const blocks = editorState.getCurrentContent().getBlocksAsArray()
  const blockKey = selection.getStartKey()
  const blockIndex = blocks.findIndex(b => b.getKey() === blockKey)

  return blocks[blockIndex].getText().slice(start, end)
}

export function getParagraphs (editorState: EditorState): string[] {
  return editorState
    .getCurrentContent()
    .getBlockMap()
    .map(block => block.getText())
    .toArray()
}
