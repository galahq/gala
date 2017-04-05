//
// Someday when Trackable has been refactored to use redux, I want this
// component to be merged with Card as the only redux powered card component,
// allowing EditableCard to be renamed CardContents
//

import React from 'react'
import { connect } from 'react-redux'

import { Editor, EditorState, RichUtils, SelectionState} from 'draft-js'
import { blockRenderMap, getStyleMap } from 'concerns/draftConfig'

import EditorToolbar from 'EditorToolbar'
import Statistics from 'Statistics'
import CitationTooltip from 'CitationTooltip'
import CommentThreadsTag from 'comments/CommentThreadsTag'
import CommentThreadsCard from 'comments/CommentThreadsCard'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
} from 'redux/actions'

import { Route, withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'concerns/routes'

const mapStateToProps = (state, {id, location, nonNarrative}) => {
  const { solid, statistics, editorState } = state.cardsById[id]
  const { openedCitation, hoveredCommentThread, acceptingSelection } = state.ui

  const {pathname} = location
  const theseCommentThreadsOpen = matchPath(pathname, commentThreadsOpen(id))
  const anyCommentThreadsOpen = matchPath(pathname, commentThreadsOpen())
  const anyCommentsOpen = matchPath(pathname, commentsOpen())
  const selectedCommentThread = anyCommentsOpen && anyCommentsOpen.params.commentThreadId

  return {
    commentable: !nonNarrative && state.caseData.commentable && !!state.caseData.reader.enrollment,
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    readOnly: !((state.edit.inProgress && !openedCitation.key)
      || acceptingSelection),
    anyCommentsOpen,
    openedCitation,
    acceptingSelection,
    hoveredCommentThread,
    selectedCommentThread,
    theseCommentThreadsOpen,
    anyCommentThreadsOpen,
    solid,
    statistics,
    editorState,
  }
}

  //deleteCard() {
    //let confirmation = window.confirm("\
//Are you sure you want to delete this card and its contents?\n\n\
//Edgenotes attached to it will not be deleted, although they will be detached.\n\n\
//This action cannot be undone.")
    //if (!confirmation) { return }

    //Orchard.prune(`cards/${this.props.id}`).then((response) => {
      //this.props.didSave(response, false, 'deleted')
    //})
  //}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    onChangeContents: eS => dispatch(updateCardContents(ownProps.id, eS)),

    onMakeSelectionForComment: (editorState) => {
      const selection = editorState.getSelection()
      if (!selection.getHasFocus())  return
      const selectionState = (
        selection.isCollapsed()
          || selection.getStartKey() !== selection.getEndKey()
      ) ? SelectionState.createEmpty(selection.getAnchorKey())
        : selection
      dispatch(applySelection(ownProps.id, selectionState))
    },

    createCommentThread: (cardId, editorState) =>
      dispatch(createCommentThread(cardId, editorState)),

  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { editable, editorState } = stateProps
  const { onChangeContents, onMakeSelectionForComment,
    createCommentThread } = dispatchProps
  const { history, location } = ownProps

  const onChange = editable ? onChangeContents : onMakeSelectionForComment

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,

    onChange,
    handleKeyCommand: command => {
      let newState = RichUtils.handleKeyCommand(editorState, command)
      return newState ? onChange(newState) && 'handled' : 'not-handled'
    },

    addCommentThread: async () => {
      if (!editable && !editorState.getSelection().isCollapsed()) {
        const threadId = await createCommentThread(ownProps.id, editorState)
        history.replace(
          `${matchPath(location.pathname, commentThreadsOpen()).url}/${threadId}`
        )
      }
    },
  }
}

class CardContents extends React.Component {
  constructor(props) {
    super(props)

    // We have to be able to respond to props change that would change
    // customStyleMap by "jiggling" each block of editorState to trigger a
    // rerender. This internal state should exactly track props, plus jiggle.
    this.state = { editorState: props.editorState }

    this._shouldJiggle = (nextProps) => (
      this.props.commentable !== nextProps.commentable ||
      this.props.theseCommentThreadsOpen !== nextProps.theseCommentThreadsOpen ||
      this.props.hoveredCommentThread !== nextProps.hoveredCommentThread ||
      this.props.selectedCommentThread !== nextProps.selectedCommentThread
    )

    this._getClassNames = () => {
      let n = []
      n = [...n, this.props.solid ? 'Card' : 'nonCard']
      if (this.props.anyCommentThreadsOpen)  n = [...n, "has-comment-threads-open"]
      if (this.props.anyCommentsOpen)  n = [...n, "has-comments-open"]
      if (this.props.acceptingSelection)  n = [...n, "accepting-selection"]
      if (this.props.commentable)  n = [...n, "commentable"]
      return n.join(' ')
    }
  }

  componentWillReceiveProps(nextProps) {
    let editorState = nextProps.editorState
    if (this._shouldJiggle(nextProps)) {
      const contentState = editorState.getCurrentContent()
      const blockMap = contentState.getBlockMap()

      const indented = blockMap.map(blk => blk.set('depth', blk.getDepth() + 1))
      const outdented = indented.map(blk => blk.set('depth', blk.getDepth() - 1))
      const outdentedContentState = contentState.set('blockMap', outdented)
      editorState = EditorState.set(editorState, {
        currentContent: outdentedContentState,
      })
    }
    this.setState({editorState})
  }

  render() {
    let {id, solid, editable, editing, onChange,
      handleKeyCommand, onDelete, openedCitation, addCommentThread,
      theseCommentThreadsOpen, hoveredCommentThread, selectedCommentThread, readOnly,
      commentable, title, match} = this.props
    let {editorState} = this.state

    let citationOpenWithinCard
    try {
      citationOpenWithinCard = citationInsideThisCard(this.cardRef, openedCitation.labelRef)
    } catch(e) {
      citationOpenWithinCard = false
    }

    const styleMap = getStyleMap({commentable, theseCommentThreadsOpen,
      hoveredCommentThread, selectedCommentThread})

    return <div
      ref={el => this.cardRef = el}
      className={this._getClassNames()}
      style={{
        paddingTop: editing && '2em',
        zIndex: theseCommentThreadsOpen && 300,
        transition: "padding-top 0.1s, flex 0.3s",
      }}
    >

      {editing && <EditorToolbar cardId={id} />}
      {title}
      <Editor ref={ed => this.editor = ed}
        readOnly={readOnly}
        customStyleMap={styleMap}
        onChange={eS => onChange(eS)}
        {...{
          blockRenderMap,
          editorState,
          handleKeyCommand,
        }}
      />

      {commentable && solid && <CommentThreadsTag cardId={id} match={match} />}

      <Route {...commentThreadsOpen(id)} render={
        (routeProps) => <CommentThreadsCard {...routeProps} cardId={id}
        addCommentThread={addCommentThread} />
      } />

      {
        citationOpenWithinCard && <CitationTooltip cardId={id}
          cardWidth={this.cardRef.clientWidth}
          {...{openedCitation, editable }}
        />
      }

      { solid && !editable && <Statistics uri={`cards::${id}`} /> }
    </div>
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CardContents))

function citationInsideThisCard(card, citation) {
  if (!card || !citation)  return false
  if (card === citation) return true
  return citationInsideThisCard(card, citation.parentElement)
}
