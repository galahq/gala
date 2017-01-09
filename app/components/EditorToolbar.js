import React from 'react'
import {
  EditorState,
  Modifier,
  RichUtils,
} from 'draft-js'

import { addEntity } from 'concerns/draftConfig.js'

const EditorToolbar = ({editorState, onChange}) => {
  let toggleInline = (style) => () => {
    onChange(RichUtils.toggleInlineStyle(editorState, style))
  }

  let toggleBlock = (type) => () => {
    onChange(RichUtils.toggleBlockType(editorState, type))
  }

  let addCitation = () => {
    const selection = editorState.getSelection()
    const collapsedSelection = selection.merge({
      anchorOffset: selection.getEndOffset(),
      focusOffset: selection.getEndOffset(),
    })
    const contentStateWithCircle = Modifier.insertText(
      editorState.getCurrentContent(),
      collapsedSelection,
      "°",
    )
    const circleSelection = collapsedSelection.merge({focusOffset: collapsedSelection.focusOffset + 1})
    const editorStateWithCircle = EditorState.set(editorState, {currentContent: contentStateWithCircle})
    const newEditorState = EditorState.forceSelection(editorStateWithCircle, circleSelection)
    onChange(addEntity(newEditorState, {type: 'CITATION', mutability: 'IMMUTABLE', data: {}}))
  }

  return <div className="c-editor-toolbar" style={styles.bar}>
    <EditorToolbarButton onClick={toggleInline('BOLD')} icon={require("toolbar-small-caps.svg")} />
    <EditorToolbarButton onClick={toggleInline('ITALIC')} icon={require(`toolbar-italic.svg`)} />
    <EditorToolbarButton onClick={toggleBlock('ordered-list-item')} icon={require(`toolbar-ol.svg`)} />
    <EditorToolbarButton onClick={toggleBlock('unordered-list-item')} icon={require(`toolbar-ul.svg`)} />
    <EditorToolbarButton onClick={() => {}} icon={require(`toolbar-edgenote.svg`)} />
    <EditorToolbarButton onClick={addCitation} icon={require(`toolbar-citation.svg`)} />
  </div>
}

export default EditorToolbar


const EditorToolbarButton = ({icon, onClick}) => <a
  onMouseDown={e => e.preventDefault()}
  onClick={onClick}
  dangerouslySetInnerHTML={{__html: icon}}
/>


const styles = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: "#D6D4CA",
    borderBottom: "1px solid #BFBDAF",
    borderRadius: '2px 2px 0 0',
    padding: '0.3em 0.75em 0 0.75em',
    boxSizing: 'border-box',
  },
}
