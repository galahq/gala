/**
 * @providesModule EditorToolbar
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { EditorState, Modifier, RichUtils } from 'draft-js'

import { addEntity } from './draftConfig'

import { updateCardContents } from 'redux/actions'

import type { Dispatch } from 'redux/actions'
import type { State } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (state: State, ownProps: OwnProps) {
  return {
    caseSlug: state.caseData.slug,
    editorState:
      state.cardsById[ownProps.cardId].editorState || EditorState.createEmpty(),
  }
}

function mapDispatchToProps (dispatch: Dispatch, ownProps: OwnProps) {
  return {
    updateEditorState: (eS: EditorState) =>
      dispatch(updateCardContents(ownProps.cardId, eS)),
  }
}

class EditorToolbar extends React.Component<{
  caseSlug: string,
  editorState: EditorState,
  getEdgenote: () => Promise<string>,
  updateEditorState: EditorState => Promise<any>,
}> {
  // These must call this.props.editorState individually to keep from
  // capturing editorState as it exists when EditorToolbar is constructed.
  //
  toggleInline = style => () =>
    this.props.updateEditorState(
      RichUtils.toggleInlineStyle(this.props.editorState, style)
    )

  toggleBlock = type => () =>
    this.props.updateEditorState(
      RichUtils.toggleBlockType(this.props.editorState, type)
    )

  handleAddCitation = () => {
    let { editorState, updateEditorState } = this.props
    let selection = editorState.getSelection()

    const collapsedSelection = selection.merge({
      anchorOffset: selection.getEndOffset(),
      focusOffset: selection.getEndOffset(),
    })

    const contentStateWithCircle = Modifier.insertText(
      editorState.getCurrentContent(),
      collapsedSelection,
      '°'
    )

    const circleSelection = collapsedSelection.merge({
      anchorOffset: collapsedSelection.focusOffset,
      focusOffset: collapsedSelection.focusOffset + 1,
    })

    updateEditorState(
      addEntity(
        { type: 'CITATION', mutability: 'IMMUTABLE', data: {}},
        editorState,
        circleSelection,
        contentStateWithCircle
      )
    )
  }

  handleAddEdgenote = () => {
    let { editorState, getEdgenote, updateEditorState } = this.props

    getEdgenote()
      .then(slug =>
        updateEditorState(
          addEntity(
            { type: 'EDGENOTE', mutability: 'MUTABLE', data: { slug }},
            editorState
          )
        )
      )
      .catch(e => e && console.log(e))
  }

  render () {
    return (
      <div className="c-editor-toolbar" style={styles.bar}>
        <EditorToolbarButton
          icon={require('images/toolbar-small-caps.svg')}
          onClick={this.toggleInline('BOLD')}
        />
        <EditorToolbarButton
          icon={require('images/toolbar-italic.svg')}
          onClick={this.toggleInline('ITALIC')}
        />
        <EditorToolbarButton
          icon={require('images/toolbar-ol.svg')}
          onClick={this.toggleBlock('ordered-list-item')}
        />
        <EditorToolbarButton
          icon={require('images/toolbar-ul.svg')}
          onClick={this.toggleBlock('unordered-list-item')}
        />
        <EditorToolbarButton
          icon={require('images/toolbar-edgenote.svg')}
          onClick={this.handleAddEdgenote}
        />
        <EditorToolbarButton
          icon={require('images/toolbar-citation.svg')}
          onClick={this.handleAddCitation}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorToolbar)

const EditorToolbarButton = ({ icon, onClick }) => (
  <a
    dangerouslySetInnerHTML={{ __html: icon }}
    onMouseDown={(e: SyntheticMouseEvent<*>) => e.preventDefault()}
    onClick={onClick}
  />
)

const styles = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#D6D4CA',
    borderBottom: '1px solid #BFBDAF',
    borderRadius: '2px 2px 0 0',
    padding: '0.3em 0.75em 0 0.75em',
    boxSizing: 'border-box',
  },
}
