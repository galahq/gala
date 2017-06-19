/**
 * @providesModule CardContents
 * @flow
 */

import React, { Component } from 'react'
import { blockRenderMap, getStyleMap } from './draftConfig'

import { Editor, EditorState } from 'draft-js'
import { Route } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'

import EditorToolbar from './EditorToolbar'
import Statistics from 'utility/Statistics'
import CitationTooltip from './CitationTooltip'
import CommentThreadsTag from 'comments/CommentThreadsTag'
import CommentThreadsCard from 'comments/CommentThreadsCard'
import { OnScreenTracker } from 'utility/Tracker'

import type { ContextRouter, Match } from 'react-router-dom'

import type { CardProps } from 'card'

type Props = CardProps &
  ContextRouter & {
    acceptingSelection: boolean,
    addCommentThread: () => Promise<void>,
    anyCommentThreadsOpen: ?Match,
    anyCommentsOpen: ?Match,
    commentable: boolean,
    createCommentThread: (cardId: string, eS: EditorState) => void,
    editable: boolean,
    editing: boolean,
    editorState: EditorState,
    handleKeyCommand: string => string | void,
    hoveredCommentThread: string | null,
    onChange: EditorState => void,
    onChangeContents: EditorState => void,
    onMakeSelectionForComment: EditorState => void,
    openedCitation: { +key?: string, +labelRef?: any },
    readOnly: boolean,
    selectedCommentThread: string | null,
    solid: boolean,
    theseCommentThreadsOpen: ?Match,
  }

class CardContents extends Component {
  props: Props

  // We have to be able to respond to props change that would change
  // customStyleMap by "jiggling" each block of editorState to trigger a
  // rerender. This internal state should exactly track props, plus jiggle.
  state = { editorState: this.props.editorState }

  cardRef: HTMLElement

  _shouldJiggle = (nextProps: Props) =>
    this.props.commentable !== nextProps.commentable ||
    this.props.theseCommentThreadsOpen !== nextProps.theseCommentThreadsOpen ||
    this.props.hoveredCommentThread !== nextProps.hoveredCommentThread ||
    this.props.selectedCommentThread !== nextProps.selectedCommentThread

  _getClassNames = () => {
    let n = []
    n = [...n, this.props.solid ? 'Card' : 'nonCard']
    if (this.props.anyCommentThreadsOpen) {
      n = [...n, 'has-comment-threads-open']
    }
    if (this.props.anyCommentsOpen) n = [...n, 'has-comments-open']
    if (this.props.acceptingSelection) n = [...n, 'accepting-selection']
    if (this.props.commentable) n = [...n, 'commentable']
    return n.join(' ')
  }

  componentWillReceiveProps (nextProps: Props) {
    let editorState = nextProps.editorState
    if (this._shouldJiggle(nextProps)) {
      const contentState = editorState.getCurrentContent()
      const blockMap = contentState.getBlockMap()

      const indented = blockMap.map(blk => blk.set('depth', blk.getDepth() + 1))
      const outdented = indented.map(blk =>
        blk.set('depth', blk.getDepth() - 1)
      )
      const outdentedContentState = contentState.set('blockMap', outdented)
      editorState = EditorState.set(editorState, {
        currentContent: outdentedContentState,
      })
    }
    this.setState({ editorState })
  }

  render () {
    const {
      id,
      solid,
      editable,
      editing,
      onChange,
      handleKeyCommand,
      openedCitation,
      addCommentThread,
      theseCommentThreadsOpen,
      hoveredCommentThread,
      selectedCommentThread,
      readOnly,
      commentable,
      title,
      match,
    } = this.props
    const { editorState } = this.state

    const citationOpenWithinCard = citationInsideThisCard(
      this.cardRef,
      openedCitation.labelRef
    )

    const styleMap = getStyleMap({
      commentable,
      theseCommentThreadsOpen,
      hoveredCommentThread,
      selectedCommentThread,
    })

    return (
      <div
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
        <Editor
          readOnly={readOnly}
          customStyleMap={styleMap}
          onChange={(eS: EditorState) => onChange(eS)}
          {...{
            blockRenderMap,
            editorState,
            handleKeyCommand,
          }}
        />

        {commentable &&
          solid &&
          <CommentThreadsTag cardId={id} match={match} />}

        <Route
          {...commentThreadsOpen(id)}
          render={routeProps =>
            <CommentThreadsCard
              {...routeProps}
              cardId={id}
              addCommentThread={addCommentThread}
            />}
        />

        {citationOpenWithinCard &&
          <CitationTooltip
            cardId={id}
            cardWidth={this.cardRef.clientWidth}
            {...{ openedCitation, editable }}
          />}

        {solid && !editable && <Statistics uri={`cards/${id}`} />}

        <OnScreenTracker
          targetKey={`cards/${id}`}
          targetParameters={{
            name: 'read_card',
            card_id: id,
          }}
        />
      </div>
    )
  }
}

export default CardContents

function citationInsideThisCard (card: ?Element, citation: ?Element): boolean {
  if (!card || !citation) return false
  if (card === citation) return true
  return citationInsideThisCard(card, citation.parentElement)
}
