/**
 * @providesModule CardContents
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { append } from 'ramda'
import { injectIntl } from 'react-intl'

import { Editor, EditorState } from 'draft-js'
import { Route } from 'react-router-dom'

import { commentThreadsOpen } from 'shared/routes'
import { getStyleMap, keyBindingFn } from 'draft/config'

import asyncComponent from 'utility/asyncComponent'

import FormattingToolbar from 'draft/FormattingToolbar'
import Statistics from 'utility/Statistics'
import CitationTooltip from './CitationTooltip'
import CommentThreadsTag from 'comments/CommentThreadsTag'
import Lock from 'utility/Lock'
import { OnScreenTracker } from 'utility/Tracker'
import { FocusContainer } from 'utility/A11y'
import { ScrollIntoView } from 'utility/ScrollView'

import type { IntlShape } from 'react-intl'
import type { CardProps } from 'card'

const CommentThreadsCard = asyncComponent(() =>
  import('comments/CommentThreadsCard').then(m => m.default)
)

type Props = CardProps & { intl: IntlShape }
type State = {
  commentable: boolean,
  editorState: EditorState,
  hoveredCommentThread: ?string,
  selectedCommentThread: ?string,
  theseCommentThreadsOpen: boolean,
}

class CardContents extends React.Component<Props, State> {
  // We have to be able to respond to props change that would change
  // customStyleMap by "jiggling" each block of editorState to trigger a
  // rerender. Internal state should exactly track props, plus jiggle.
  static getDerivedStateFromProps (props: Props, state: State) {
    let { editorState } = props
    const {
      commentable,
      hoveredCommentThread,
      selectedCommentThread,
      theseCommentThreadsOpen,
    } = props

    if (shouldJiggle(props, state)) editorState = jiggle(editorState)

    return {
      commentable,
      hoveredCommentThread,
      selectedCommentThread,
      theseCommentThreadsOpen,
      editorState,
    }
  }

  state = {
    editorState: this.props.editorState,

    // Cached props for comparison with new props in shouldJiggle
    commentable: this.props.commentable,
    hoveredCommentThread: this.props.hoveredCommentThread,
    selectedCommentThread: this.props.selectedCommentThread,
    theseCommentThreadsOpen: this.props.theseCommentThreadsOpen,
  }

  cardRef: ?HTMLElement

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

  render () {
    const {
      id,
      position,
      solid,
      nonNarrative,
      editable,
      onChange,
      handleKeyCommand,
      handleBeforeInput,
      handleDeleteCard,
      getEdgenote,
      openedCitation,
      addCommentThread,
      theseCommentThreadsOpen,
      hoveredCommentThread,
      selectedCommentThread,
      acceptingSelection,
      readOnly,
      commentable,
      deletable,
      title,
      match,
      intl,
      dragHandleProps,
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

    function keyBindingFnWithOverrides (e: SyntheticKeyboardEvent<*>): ?string {
      if (theseCommentThreadsOpen && acceptingSelection && e.key === 'Enter') {
        addCommentThread()
        return
      }
      return keyBindingFn(e)
    }

    return (
      <Container>
        <Card
          ref={el => (this.cardRef = el)}
          className={this._getClassNames()}
          editable={editable}
          theseCommentThreadsOpen={theseCommentThreadsOpen}
        >
          <Lock type="Card" param={id}>
            {({ onBeginEditing, onFinishEditing }) => (
              <>
                {theseCommentThreadsOpen ? <ScrollIntoView /> : null}

                {editable && (
                  <FormattingToolbar
                    actions={{
                      code: false,
                      header: true,
                      subheading: true,
                      blockquote: true,
                      addEdgenoteEntity: !nonNarrative,
                      addCitationEntity: !nonNarrative,
                      addMathEntity: !nonNarrative,
                      subscript: true,
                      superscript: true,
                    }}
                    editorState={editorState}
                    getEdgenote={getEdgenote}
                    cardId={id}
                    editable={editable}
                    onChange={onChange}
                  />
                )}

                {title}

                <FocusContainer
                  active={!!(theseCommentThreadsOpen && acceptingSelection)}
                  priority={100}
                >
                  <Editor
                    placeholder={intl.formatMessage({
                      id: 'cards.edit.writeSomething',
                    })}
                    readOnly={readOnly}
                    customStyleMap={styleMap}
                    editorState={editorState}
                    keyBindingFn={keyBindingFnWithOverrides}
                    handleKeyCommand={handleKeyCommand}
                    handleBeforeInput={handleBeforeInput}
                    onFocus={editable ? onBeginEditing : () => {}}
                    onChange={onChange}
                    onBlur={editable ? onFinishEditing : () => {}}
                  />
                </FocusContainer>

                {commentable && solid && (
                  <CommentThreadsTag cardId={id} match={match} />
                )}

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
                    openedCitation={openedCitation}
                    editable={editable}
                  />
                )}

                {editable && deletable && (
                  <DeleteCardButton id={id} onClick={handleDeleteCard} />
                )}

                <DragHandle hidden={!editable} {...dragHandleProps} />

                {solid && !editable && (
                  <Statistics key={`cards/${id}`} uri={`cards/${id}`} />
                )}

                <OnScreenTracker
                  targetKey={`cards/${id}`}
                  targetParameters={{
                    name: 'read_card',
                    card_id: parseInt(id, 10),
                  }}
                />
              </>
            )}
          </Lock>
        </Card>
      </Container>
    )
  }
}

export default injectIntl(CardContents)

function shouldJiggle (props: Props, state: State) {
  return (
    props.commentable !== state.commentable ||
    props.theseCommentThreadsOpen !== state.theseCommentThreadsOpen ||
    props.hoveredCommentThread !== state.hoveredCommentThread ||
    props.selectedCommentThread !== state.selectedCommentThread
  )
}

function jiggle (editorState: EditorState): EditorState {
  const contentState = editorState.getCurrentContent()
  const blockMap = contentState.getBlockMap()

  const indented = blockMap.map(blk => blk.set('depth', blk.getDepth() + 1))
  const outdented = indented.map(blk => blk.set('depth', blk.getDepth() - 1))
  const outdentedContentState = contentState.set('blockMap', outdented)
  return EditorState.set(editorState, {
    currentContent: outdentedContentState,
  })
}

function citationInsideThisCard (card: ?Element, citation: ?Element): boolean {
  if (!card || !citation) return false
  if (card === citation) return true
  return citationInsideThisCard(card, citation.parentElement)
}

const Container = styled.div.attrs({ className: 'card-container' })`
  grid-column: 1 / span 2;
  grid-row: 1 / highlighted;
`

const Card = styled.div`
  padding-top: ${p => p.editable && '2em'};
  z-index: ${p => p.theseCommentThreadsOpen && 300};

  & > .pt-button-group {
    position: absolute;
    margin-top: -14px;
  }

  & .c-edgenote-entity {
    ${p =>
      p.editable &&
      css`
        pointer-events: none;
      `};
  }

  & blockquote {
    margin-top: 19px;
  }
`

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

const DragHandle = styled.span.attrs({
  className: 'pt-icon pt-icon-drag-handle-vertical',
})`
  ${p =>
    p.hidden &&
    css`
      display: none;
    `};

  left: 0;
  opacity: 0.5;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`
