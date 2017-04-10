// @flow
import React from 'react'
import { connect } from 'react-redux'

import { Editor, EditorState, RichUtils, SelectionState } from 'draft-js'
import { blockRenderMap, getStyleMap } from './draftConfig'

import EditorToolbar from './EditorToolbar'
import Statistics from 'utility/Statistics'
import CitationTooltip from './CitationTooltip'
import CommentThreadsTag from 'comments/CommentThreadsTag'
import CommentThreadsCard from 'comments/CommentThreadsCard'
import { OnScreenTracker } from 'utility/Tracker'

import {
  updateCardContents,
  applySelection,
  createCommentThread,
} from 'redux/actions'

import { Route, withRouter, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'shared/routes'

import type { Location } from 'react-router-dom'

import type { State } from 'redux/state'

type OwnProps = {
  id: string,
  location: Location,
  nonNarrative: boolean,
}

function mapStateToProps (
  state: State,
  { id, location, nonNarrative }: OwnProps,
) {
  const { solid, statistics, editorState } = state.cardsById[id]
  const { openedCitation, hoveredCommentThread, acceptingSelection } = state.ui

  const { pathname } = location
  const theseCommentThreadsOpen = matchPath(pathname, commentThreadsOpen(id))
  const anyCommentThreadsOpen = matchPath(pathname, commentThreadsOpen())
  const anyCommentsOpen = matchPath(pathname, commentsOpen())
  const selectedCommentThread = anyCommentsOpen && anyCommentsOpen.params.commentThreadId

  return {
    commentable: !nonNarrative && state.caseData.commentable &&
      !!state.caseData.reader.enrollment,
    editable: state.edit.inProgress,
    editing: state.edit.inProgress && editorState.getSelection().hasFocus,
    readOnly: !((state.edit.inProgress && !openedCitation.key) ||
      acceptingSelection),
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

function mapDispatchToProps (dispatch: *, ownProps: OwnProps) {
  return {
    onChangeContents: (eS: EditorState) =>
      dispatch(updateCardContents(ownProps.id, eS)),

    onMakeSelectionForComment: (eS: EditorState) => {
      const selection = eS.getSelection()
      if (!selection.getHasFocus()) return
      const selectionState = (
        selection.isCollapsed() ||
          selection.getStartKey() !== selection.getEndKey()
      ) ? SelectionState.createEmpty(selection.getAnchorKey())
        : selection
      dispatch(applySelection(ownProps.id, selectionState))
    },

    createCommentThread: (cardId: string, eS: EditorState) =>
      dispatch(createCommentThread(cardId, eS)),

  }
}

function mergeProps (stateProps, dispatchProps, ownProps) {
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
  constructor (props: *) {
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
      if (this.props.anyCommentThreadsOpen) n = [...n, 'has-comment-threads-open']
      if (this.props.anyCommentsOpen) n = [...n, 'has-comments-open']
      if (this.props.acceptingSelection) n = [...n, 'accepting-selection']
      if (this.props.commentable) n = [...n, 'commentable']
      return n.join(' ')
    }
  }

  componentWillReceiveProps (nextProps) {
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
    this.setState({ editorState })
  }

  render () {
    let { id, solid, editable, editing, onChange,
      handleKeyCommand, openedCitation, addCommentThread,
      theseCommentThreadsOpen, hoveredCommentThread, selectedCommentThread, readOnly,
      commentable, title, match } = this.props
    let { editorState } = this.state

    let citationOpenWithinCard
    try {
      citationOpenWithinCard = citationInsideThisCard(this.cardRef, openedCitation.labelRef)
    } catch (e) {
      citationOpenWithinCard = false
    }

    const styleMap = getStyleMap({ commentable,
      theseCommentThreadsOpen,
      hoveredCommentThread,
      selectedCommentThread })

    return <div
      ref={(el: HTMLElement) => (this.cardRef = el)}
      className={this._getClassNames()}
      style={{
        paddingTop: editing && '2em',
        zIndex: theseCommentThreadsOpen && 300,
        transition: 'padding-top 0.1s, flex 0.3s',
      }}
    >

      {editing && <EditorToolbar cardId={id} />}
      {title}
      <Editor ref={(ed: HTMLElement) => (this.editor = ed)}
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

      <Route
        {...commentThreadsOpen(id)}
        render={
          (routeProps) => <CommentThreadsCard
            {...routeProps}
            cardId={id}
            addCommentThread={addCommentThread}
          />
        }
      />

      {
        citationOpenWithinCard && <CitationTooltip cardId={id}
          cardWidth={this.cardRef.clientWidth}
          {...{ openedCitation, editable }}
        />
      }

      { solid && !editable && <Statistics uri={`cards/${id}`} /> }

      <OnScreenTracker
        targetKey={`cards/${id}`}
        targetParameters={{
          name: 'read_card',
          card_id: id,
        }}
      />
    </div>
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CardContents))

function citationInsideThisCard (card, citation) {
  if (!card || !citation) return false
  if (card === citation) return true
  return citationInsideThisCard(card, citation.parentElement)
}
