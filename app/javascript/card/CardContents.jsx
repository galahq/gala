/**
 * @providesModule CardContents
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { append } from 'ramda'

import { Editor, EditorState } from 'draft-js'
import { Route } from 'react-router-dom'
import { commentThreadsOpen } from 'shared/routes'
import { blockRenderMap, getStyleMap } from './draftConfig'

import asyncComponent from 'utility/asyncComponent'

import EditorToolbar from './EditorToolbar'
import Statistics from 'utility/Statistics'
import CitationTooltip from './CitationTooltip'
import CommentThreadsTag from 'comments/CommentThreadsTag'
import { OnScreenTracker } from 'utility/Tracker'
import { FocusContainer } from 'utility/A11y'
import { ScrollIntoView } from 'utility/ScrollView'

import type { ContextRouter, Match } from 'react-router-dom'

import type { CardProps } from 'card'

const CommentThreadsCard = asyncComponent(() =>
  import('comments/CommentThreadsCard').then(m => m.default)
)

type Props = {
  acceptingSelection: boolean,
  addCommentThread: () => Promise<void>,
  anyCommentThreadsOpen: ?Match,
  anyCommentsOpen: ?Match,
  commentable: boolean,
  createCommentThread: (cardId: string, eS: EditorState) => any,
  editable: boolean,
  editing: boolean,
  editorState: EditorState,
  handleKeyCommand: string => any,
  handleDeleteCard: () => any,
  hoveredCommentThread: string | null,
  onChange: EditorState => any,
  onChangeContents: EditorState => any,
  onMakeSelectionForComment: EditorState => any,
  openedCitation: { +key?: string, +labelRef?: any },
  readOnly: boolean,
  selectedCommentThread: string | null,
  solid: boolean,
  theseCommentThreadsOpen: ?Match,
  ...CardProps,
  ...ContextRouter,
}

class CardContents extends React.Component<Props, *> {
  // We have to be able to respond to props change that would change
  // customStyleMap by "jiggling" each block of editorState to trigger a
  // rerender. This internal state should exactly track props, plus jiggle.
  state = { editorState: this.props.editorState }

  cardRef: ?HTMLElement

  _shouldJiggle = (nextProps: Props) =>
    this.props.commentable !== nextProps.commentable ||
    this.props.theseCommentThreadsOpen !== nextProps.theseCommentThreadsOpen ||
    this.props.hoveredCommentThread !== nextProps.hoveredCommentThread ||
    this.props.selectedCommentThread !== nextProps.selectedCommentThread

  _getClassNames = () => {
    let n: string[] = []
    n = append(this.props.solid ? 'Card' : 'nonCard', n)
    if (this.props.anyCommentThreadsOpen) {
      n = append('has-comment-threads-open', n)
    }
    if (this.props.anyCommentsOpen) n = append('has-comments-open', n)
    if (this.props.acceptingSelection) n = append('accepting-selection', n)
    if (this.props.commentable) n = append('commentable', n)
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
      handleDeleteCard,
      openedCitation,
      addCommentThread,
      theseCommentThreadsOpen,
      hoveredCommentThread,
      selectedCommentThread,
      acceptingSelection,
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
        ref={el => (this.cardRef = el)}
        className={this._getClassNames()}
        style={{
          paddingTop: editing && '2em',
          zIndex: theseCommentThreadsOpen && 300,
          transition: 'padding-top 0.1s, flex 0.3s',
        }}
      >
        {theseCommentThreadsOpen ? <ScrollIntoView /> : null}

        {editing && <EditorToolbar cardId={id} />}
        {title}
        <FocusContainer
          active={!!(theseCommentThreadsOpen && acceptingSelection)}
          priority={100}
        >
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
        </FocusContainer>

        {commentable &&
          solid && <CommentThreadsTag cardId={id} match={match} />}

        <Route
          {...commentThreadsOpen(id)}
          render={routeProps => (
            <CommentThreadsCard
              {...routeProps}
              cardId={id}
              addCommentThread={addCommentThread}
            />
          )}
        />

        {citationOpenWithinCard && (
          <CitationTooltip
            cardId={id}
            cardWidth={this.cardRef ? this.cardRef.clientWidth : 0}
            {...{ openedCitation, editable }}
          />
        )}

        {editable && <DeleteCardButton id={id} onClick={handleDeleteCard} />}

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

const DeleteCardButton = styled.button.attrs({
  className: 'pt-button pt-minimal pt-icon-trash pt-intent-danger',
})`
  position: absolute;
  top: 0;
  right: 0;

  transition: opacity ease-out 0.3s;
  opacity: 0;

  .Card:hover & {
    opacity: 1;
  }
`
