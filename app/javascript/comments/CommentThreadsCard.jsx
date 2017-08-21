/**
 * @providesModule CommentThreadsCard
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Portal } from '@blueprintjs/core'

import { acceptSelection } from 'redux/actions'

import { FormattedMessage } from 'react-intl'

import CommentThread from 'comments/CommentThread'
import CommentsCard from 'comments/CommentsCard'
import CommunityChooser from 'overview/CommunityChooser'
import Icon from 'utility/Icon'

import { EditorState } from 'draft-js'
import { Link, Route, matchPath } from 'react-router-dom'
import { elementOpen, commentsOpen } from 'shared/routes'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

type OwnProps = ContextRouter & {
  cardId: string,
}
function mapStateToProps (state: State, { cardId, location }: OwnProps) {
  const params = matchPath(location.pathname, elementOpen())
  if (params == null) {
    throw new Error('CommentThreadsCard should not be mounted at this route.')
  }

  const editorState =
    state.cardsById[cardId].editorState || EditorState.createEmpty()

  return {
    commentThreads: state.cardsById[cardId].commentThreads,
    acceptingSelection: state.ui.acceptingSelection,
    selectionPending: !editorState.getSelection().isCollapsed(),
    closeCommentThreadsPath: params.url,
  }
}

const CommentThreadsCard = ({
  cardId,
  commentThreads,
  acceptingSelection,
  selectionPending,
  acceptSelection,
  closeCommentThreadsPath,
  addCommentThread,
  location,
  match,
  history,
}) => {
  if (commentThreads == null) return null

  return (
    <div className="CommentThreads">
      <CommentThreadsWindow>
        <div style={styles.header}>
          <Link
            replace
            to={closeCommentThreadsPath}
            className="CommentThread__icon-button"
            onClick={() => acceptSelection(false)}
          >
            <Icon
              filename="comments-close"
              style={{ ...styles.toolbarButton, cursor: 'pointer' }}
            />
          </Link>

          <FormattedMessage
            id="comments.nResponses"
            defaultMessage={`{count, number} {count, plural,
            one {response}
            other {responses}
          }`}
            values={{ count: commentThreads.length }}
          />

          <div style={styles.toolbarButton} />
        </div>

        <ol style={styles.commentList}>
          {commentThreads.map((thread, i) =>
            <CommentThread
              key={`${thread.id}`}
              cardId={cardId}
              threadId={thread.id}
              location={location}
              match={match}
              history={history}
              last={i === commentThreads.length - 1}
            />
          )}
        </ol>

        <div className="CommentThreads__footer">
          <button
            className="o-button CommentThreads__new-button"
            disabled={acceptingSelection && !selectionPending}
            onClick={acceptingSelection ? addCommentThread : acceptSelection}
          >
            {!acceptingSelection
              ? <FormattedMessage
                id="comments.writeNew"
                defaultMessage="Write a new response"
              />
              : !selectionPending
                ? <FormattedMessage
                  id="comments.select"
                  defaultMessage="Select a few words"
                />
                : <FormattedMessage
                  id="comments.here"
                  defaultMessage="Respond here"
                />}
          </button>
        </div>
      </CommentThreadsWindow>

      {acceptingSelection &&
        selectionPending &&
        <ChooserWindow>
          <CommunityChooser white disabled />
        </ChooserWindow>}

      {
        <Portal>
          <Link
            replace
            to={closeCommentThreadsPath}
            style={styles.backdrop}
            onClick={() => acceptSelection(false)}
          />
        </Portal>
      }

      <Route {...commentsOpen()} component={CommentsCard} />
    </div>
  )
}

export default connect(mapStateToProps, { acceptSelection })(CommentThreadsCard)

const styles = {
  backdrop: {
    position: 'fixed',
    backgroundColor: 'rgba(0,0,0,0.5)',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 200,
  },

  header: {
    backgroundColor: '#493092',
    textTransform: 'uppercase',
    fontSize: '10pt',
    letterSpacing: 0.6,
    padding: '0.25em 0 0',
    borderBottom: '1px solid #351D7A',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  commentList: {
    margin: 0,
    padding: 0,
    minHeight: '1em',
  },

  toolbarButton: {
    width: 11,
    padding: '0 0.5em',
  },
}

const CommentThreadsWindow = styled.div`
  background-color: #7351d4;
  box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.3);
  color: white;
`

const ChooserWindow = styled.div`
  margin-top: 1em;
  border-radius: 2pt;
`
