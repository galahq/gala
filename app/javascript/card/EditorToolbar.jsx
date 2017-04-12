import React from 'react'
import { connect } from 'react-redux'
import { EditorState, Modifier, RichUtils } from 'draft-js'

import { addEntity } from './draftConfig'
import { Orchard } from 'shared/orchard'

import { updateCardContents, createEdgenote } from 'redux/actions'

import type { State, Edgenote } from 'redux/state'

type OwnProps = { cardId: string }
function mapStateToProps (state: State, ownProps: OwnProps) {
  return {
    caseSlug: state.caseData.slug,
    editorState: state.cardsById[ownProps.cardId].editorState,
    edgenoteExists: (slug: string) => !!state.edgenotesBySlug[slug],
  }
}

function mapDispatchToProps (dispatch: *, ownProps: OwnProps) {
  return {
    updateEditorState: (eS: EditorState) =>
      dispatch(updateCardContents(ownProps.cardId, eS)),
    createEdgenoteRecord: (slug: string, data: Edgenote) =>
      dispatch(createEdgenote(slug, data)),
  }
}

class EditorToolbar extends React.Component {
  constructor (props) {
    super(props)

    let { updateEditorState } = this.props

    // These must call this.props.editorState individually to keep from
    // capturing editorState as it exists when EditorToolbar is constructed.
    //
    this.toggleInline = style =>
      () =>
        updateEditorState(
          RichUtils.toggleInlineStyle(this.props.editorState, style),
        )

    this.toggleBlock = type =>
      () =>
        updateEditorState(
          RichUtils.toggleBlockType(this.props.editorState, type),
        )

    this.handleAddCitation = this.handleAddCitation.bind(this)
    this.handleAddEdgenote = this.handleAddEdgenote.bind(this)
  }

  handleAddCitation () {
    let { editorState, updateEditorState } = this.props
    let selection = editorState.getSelection()

    const collapsedSelection = selection.merge({
      anchorOffset: selection.getEndOffset(),
      focusOffset: selection.getEndOffset(),
    })

    const contentStateWithCircle = Modifier.insertText(
      editorState.getCurrentContent(),
      collapsedSelection,
      '°',
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
        contentStateWithCircle,
      ),
    )
  }

  handleAddEdgenote () {
    let {
      caseSlug,
      editorState,
      updateEditorState,
      edgenoteExists,
      createEdgenoteRecord,
    } = this.props

    const slug = prompt('Slug?')
    if (slug.length === '') return

    const addHighlight = () =>
      updateEditorState(
        addEntity(
          { type: 'EDGENOTE', mutability: 'MUTABLE', data: { slug }},
          editorState,
        ),
      )

    if (edgenoteExists(slug)) {
      addHighlight()
    } else {
      Orchard.graft(`cases/${caseSlug}/edgenotes`, { slug }).then(data => {
        createEdgenoteRecord(slug, data)
        addHighlight()
      })
    }
  }

  render () {
    return (
      <div className="c-editor-toolbar" style={styles.bar}>
        <EditorToolbarButton
          icon={require('images/toolbar-small-caps.svg')}
          onClick={this.toggleInline('BOLD')}
        />
        <EditorToolbarButton
          icon={require(`images/toolbar-italic.svg`)}
          onClick={this.toggleInline('ITALIC')}
        />
        <EditorToolbarButton
          icon={require(`images/toolbar-ol.svg`)}
          onClick={this.toggleBlock('ordered-list-item')}
        />
        <EditorToolbarButton
          icon={require(`images/toolbar-ul.svg`)}
          onClick={this.toggleBlock('unordered-list-item')}
        />
        <EditorToolbarButton
          icon={require(`images/toolbar-edgenote.svg`)}
          onClick={this.handleAddEdgenote}
        />
        <EditorToolbarButton
          icon={require(`images/toolbar-citation.svg`)}
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
    onMouseDown={e => e.preventDefault()}
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
