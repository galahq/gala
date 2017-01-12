import React from 'react'
import {
  EditorState,
  Modifier,
  RichUtils,
} from 'draft-js'

import { addEntity } from 'concerns/draftConfig.js'

class EditorToolbar extends React.Component {
  constructor(props) {
    super(props)

    let {onChange} = this.props

    // These must call this.props.editorState individually to keep from
    // capturing editorState as it exists when EditorToolbar is constructed.
    //
    this.toggleInline = (style) =>
      () => onChange(RichUtils.toggleInlineStyle(this.props.editorState, style))

    this.toggleBlock = (type) =>
      () => onChange(RichUtils.toggleBlockType(this.props.editorState, type))

    this.addCitation = this.addCitation.bind(this)
    this.addEdgenote = this.addEdgenote.bind(this)
  }

  addCitation() {
    let {onChange, editorState} = this.props
    let selection = editorState.getSelection()

    const collapsedSelection = selection.merge({
      anchorOffset: selection.getEndOffset(),
      focusOffset: selection.getEndOffset(),
    })

    const contentStateWithCircle = Modifier.insertText(
      editorState.getCurrentContent(),
      collapsedSelection,
      "°",
    )

    const circleSelection = collapsedSelection.merge({
      anchorOffset: collapsedSelection.focusOffset,
      focusOffset: collapsedSelection.focusOffset + 1,
    })

    onChange(addEntity({type: 'CITATION', mutability: 'IMMUTABLE', data: {}}, editorState, circleSelection, contentStateWithCircle ))
  }

  addEdgenote() {
    const slug = prompt('Slug?')
    this.props.onChange(addEntity({type: 'EDGENOTE', mutability: 'MUTABLE', data: {slug}}, this.props.editorState))
  }

  render() {
    return <div className="c-editor-toolbar" style={styles.bar}>
      <EditorToolbarButton onClick={this.toggleInline('BOLD')} icon={require("toolbar-small-caps.svg")} />
      <EditorToolbarButton onClick={this.toggleInline('ITALIC')} icon={require(`toolbar-italic.svg`)} />
      <EditorToolbarButton onClick={this.toggleBlock('ordered-list-item')} icon={require(`toolbar-ol.svg`)} />
      <EditorToolbarButton onClick={this.toggleBlock('unordered-list-item')} icon={require(`toolbar-ul.svg`)} />
      <EditorToolbarButton onClick={this.addEdgenote} icon={require(`toolbar-edgenote.svg`)} />
      <EditorToolbarButton onClick={this.addCitation} icon={require(`toolbar-citation.svg`)} />
    </div>
  }
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
