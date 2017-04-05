import React from 'react'
import { connect } from 'react-redux'
import {
  EditorState,
  Modifier,
  RichUtils,
} from 'draft-js'

import { addEntity } from 'concerns/draftConfig.js'
import { Orchard } from 'concerns/orchard.js'

import { updateCardContents, createEdgenote } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    caseSlug: state.caseData.slug,
    editorState: state.cardsById[ownProps.cardId].editorState,
    edgenoteExists: slug => !!state.edgenotesBySlug[slug],
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    updateEditorState: eS => dispatch(updateCardContents(ownProps.cardId, eS)),
    createEdgenoteRecord: (slug, data) => dispatch(createEdgenote(slug, data)),
  }
}

class EditorToolbar extends React.Component {
  constructor(props) {
    super(props)

    let {updateEditorState} = this.props

    // These must call this.props.editorState individually to keep from
    // capturing editorState as it exists when EditorToolbar is constructed.
    //
    this.toggleInline = (style) =>
      () => updateEditorState(RichUtils.toggleInlineStyle(this.props.editorState, style))

    this.toggleBlock = (type) =>
      () => updateEditorState(RichUtils.toggleBlockType(this.props.editorState, type))

    this.addCitation = this.addCitation.bind(this)
    this.addEdgenote = this.addEdgenote.bind(this)
  }

  addCitation() {
    let {editorState, updateEditorState} = this.props
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

    updateEditorState(addEntity({type: 'CITATION', mutability: 'IMMUTABLE', data: {}},
                       editorState, circleSelection, contentStateWithCircle ))
  }

  addEdgenote() {
    let {
      caseSlug,
      editorState,
      updateEditorState,
      edgenoteExists,
      createEdgenoteRecord,
    } = this.props

    const slug = prompt('Slug?')
    if (slug.length === "")  return

    const addHighlight = () => updateEditorState(
      addEntity({type: 'EDGENOTE', mutability: 'MUTABLE', data: {slug}},
                editorState)
    )

    if (edgenoteExists(slug)) {
      addHighlight()
    } else {
      Orchard.graft(`cases/${caseSlug}/edgenotes`, {slug}).then(
        data => {
          createEdgenoteRecord(slug, data)
          addHighlight()
        }
      )
    }

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

export default connect(mapStateToProps, mapDispatchToProps)(EditorToolbar)


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
