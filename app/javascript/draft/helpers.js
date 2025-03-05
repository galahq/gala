/**
 * Helper functions for manipulating the Draft.js EditorState data structure
 *
 * @flow
 */

import React from 'react'
import { RichUtils, Modifier, EditorState, SelectionState } from 'draft-js'
import getRangesForDraftEntity from 'draft-js/lib/getRangesForDraftEntity'
import { Intent } from '@blueprintjs/core'

import type { ContentState } from 'draft-js'
import type { DraftEntityMutability } from 'draft-js/lib/DraftEntityMutability'
import type { Props as ToolbarProps } from 'draft/FormattingToolbar'

// We need the selection to remain visible while the user interacts with the
// edgenote creation popover, so we add an inline style of type "SELECTION",
// which gives a grey background.
export function addShadowSelection (editorState: EditorState): EditorState {
  if (!editorState.getSelection().isCollapsed()) {
    return RichUtils.toggleInlineStyle(editorState, 'SELECTION')
  } else {
    return editorState
  }
}

export function removeShadowSelection (editorState: EditorState): EditorState {
  if (editorState.getCurrentInlineStyle().has('SELECTION')) {
    return RichUtils.toggleInlineStyle(editorState, 'SELECTION')
  } else {
    return editorState
  }
}

export function addEntity (
  {
    type,
    mutability,
    data,
  }: { type: $FlowIssue, mutability: DraftEntityMutability, data: Object },
  editorState: EditorState,
  selection: SelectionState = editorState.getSelection(),
  contentState: ContentState = editorState.getCurrentContent()
) {
  const contentStateWithEntity = contentState.createEntity(
    type,
    mutability,
    data
  )
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const contentStateWithEntityApplied = Modifier.applyEntity(
    contentStateWithEntity,
    selection,
    entityKey
  )

  const editorStateWithEntity = EditorState.push(
    editorState,
    contentStateWithEntityApplied,
    'apply-entity'
  )
  return editorStateWithEntity
}

export function addEdgenoteEntity (
  slug: string,
  editorState: EditorState
): EditorState {
  const edgenoteEntityProps = {
    type: 'EDGENOTE',
    mutability: 'MUTABLE',
    data: { slug },
  }
  return addEntity(edgenoteEntityProps, editorState)
}

const getEntitySelectionState = (
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: string
) => {
  const selectionKey = selectionState.getAnchorKey()
  const selectionOffset = selectionState.getAnchorOffset()
  const block = contentState.getBlockForKey(selectionKey)
  const blockKey = block.getKey()

  let entitySelection: ?SelectionState = null
  getRangesForDraftEntity(block, entityKey).forEach(range => {
    if (range.start <= selectionOffset && selectionOffset <= range.end) {
      entitySelection = new SelectionState({
        anchorOffset: range.start,
        anchorKey: blockKey,
        focusOffset: range.end,
        focusKey: blockKey,
        isBackward: false,
        hasFocus: selectionState.getHasFocus(),
      })
    }
  })
  return entitySelection
}

export function removeSelectedEntity (editorState: EditorState) {
  const entityKey = getSelectedEntityKey(editorState)
  if (entityKey == null) return editorState

  const entitySelection = getEntitySelectionState(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    entityKey
  )
  if (entitySelection == null) return editorState

  const withoutEntity = Modifier.applyEntity(
    editorState.getCurrentContent(),
    entitySelection,
    null
  )
  return EditorState.push(editorState, withoutEntity, 'apply-entity')
}

export function getSelectedEntityKey (editorState: EditorState) {
  const selection = editorState.getSelection()
  return editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getEntityAt(selection.getStartOffset())
}

// Is the block under the cursor of the given type?
export const blockTypeEquals = (type: string) => (editorState: EditorState) =>
  editorState
    .getCurrentContent()
    .getBlockForKey(editorState.getSelection().getStartKey())
    .getType() === type

// Is the entity under the cursor of the given type?
export const entityTypeEquals = (type: string) => (
  editorState: EditorState
) => {
  const entityKey = getSelectedEntityKey(editorState)
  if (entityKey == null) return false

  return (
    editorState
      .getCurrentContent()
      .getEntity(entityKey)
      .getType() === type
  )
}

export async function toggleEdgenote (
  editorState: EditorState,
  { displayToast, getEdgenote, intl }: ToolbarProps
) {
  if (getEdgenote == null) return editorState

  if (entityTypeEquals('EDGENOTE')(editorState)) {
    return removeSelectedEntity(editorState)
  }

  if (editorState.getSelection().isCollapsed()) {
    displayToast({
      icon: 'error',
      intent: Intent.WARNING,
      message: (
        <span
          className="bp3-dark"
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage({
              id: 'edgenotes.new.makeSelectionHtml',
            }),
          }}
        />
      ),
    })
    return editorState
  }

  return getEdgenote().then(slug => addEdgenoteEntity(slug, editorState))
}

export function addCitationEntity (
  editorState: EditorState,
  { displayToast, intl }: ToolbarProps
) {
  let selection = editorState.getSelection()

  const collapsedSelection: SelectionState = selection.merge({
    anchorOffset: selection.getEndOffset(),
    focusOffset: selection.getEndOffset(),
  })

  const contentStateWithCircle = Modifier.insertText(
    editorState.getCurrentContent(),
    collapsedSelection,
    '°'
  )

  const circleSelection: SelectionState = collapsedSelection.merge({
    anchorOffset: collapsedSelection.focusOffset,
    focusOffset: collapsedSelection.focusOffset + 1,
  })

  displayToast({
    icon: 'tick',
    intent: Intent.SUCCESS,
    message: (
      <span
        className="bp3-dark"
        dangerouslySetInnerHTML={{
          __html: intl.formatMessage({
            id: 'cards.edit.citationAdded',
          }),
        }}
      />
    ),
  })

  return addEntity(
    { type: 'CITATION', mutability: 'IMMUTABLE', data: {}},
    editorState,
    circleSelection,
    contentStateWithCircle
  )
}

export async function toggleMath (
  editorState: EditorState,
  { cardId, displayToast, intl }: ToolbarProps
) {
  if (entityTypeEquals('MATH')(editorState)) {
    return removeSelectedEntity(editorState)
  }

  if (editorState.getSelection().isCollapsed()) {
    displayToast({
      icon: 'error',
      intent: Intent.WARNING,
      message: (
        <span
          className="bp3-dark"
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage({
              id: 'cards.edit.mathInstructions',
            }),
          }}
        />
      ),
    })
    return editorState
  }

  displayToast({
    icon: 'tick',
    intent: Intent.SUCCESS,
    message: (
      <span
        className="bp3-dark"
        dangerouslySetInnerHTML={{
          __html: intl.formatMessage({
            id: 'cards.edit.mathAdded',
          }),
        }}
      />
    ),
  })

  return addEntity({
    type: 'MATH',
    mutability: 'IMMUTABLE',
    data: { cardId },
  }, editorState)
}

export async function toggleRevealableEntity (
  editorState: EditorState,
  { cardId, displayToast, intl }: ToolbarProps
) {
  if (entityTypeEquals('REVEALABLE')(editorState)) {
    return removeSelectedEntity(editorState)
  }

  if (editorState.getSelection().isCollapsed()) {
    displayToast({
      icon: 'error',
      intent: Intent.WARNING,
      message: (
        <span
          className="bp3-dark"
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage({
              id: 'cards.edit.makeRevealableSelection',
            }),
          }}
        />
      ),
    })
    return editorState
  }

  return addEntity({
    type: 'REVEALABLE',
    mutability: 'MUTABLE',
    data: { cardId },
  }, editorState)
}

export async function toggleSubscript (editorState: EditorState) {
  if (entityTypeEquals('SUBSCRIPT')(editorState)) {
    return removeSelectedEntity(editorState)
  }

  if (editorState.getSelection().isCollapsed()) {
    return editorState
  }

  return addEntity({
    type: 'SUBSCRIPT',
    mutability: 'MUTABLE',
    data: {},
  }, editorState)
}

export async function toggleSuperscript (editorState: EditorState) {
  if (entityTypeEquals('SUPERSCRIPT')(editorState)) {
    return removeSelectedEntity(editorState)
  }

  if (editorState.getSelection().isCollapsed()) {
    return editorState
  }

  return addEntity({
    type: 'SUPERSCRIPT',
    mutability: 'MUTABLE',
    data: {},
  }, editorState)
}
