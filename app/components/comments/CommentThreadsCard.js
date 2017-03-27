import React from 'react'
import { connect } from 'react-redux'
import { Portal } from '@blueprintjs/core'

import {
  closeCommentThreads,
  acceptSelection,
} from 'redux/actions.js'

import { FormattedMessage } from 'react-intl'

import CommentThread from 'comments/CommentThread.js'
import CommentsCard from 'comments/CommentsCard.js'
import Icon from 'Icon.js'

import { Link, Route, matchPath } from 'react-router-dom'
import { elementOpen, commentsOpen } from 'concerns/routes'

function mapStateToProps(state, {cardId}) {

  return {
    commentThreads: state.cardsById[cardId].commentThreads,
    acceptingSelection: state.ui.acceptingSelection,
    selectionPending: !state.cardsById[cardId].editorState
      .getSelection().isCollapsed(),
  }
}

const CommentThreadsCard = ({cardId, commentThreads, acceptingSelection,
                            selectionPending,
                            acceptSelection,
                            addCommentThread, location, match, history}) => {
  return <div className="CommentThreads">
    <div className={`CommentThreads__window`}>
      <div style={styles.header}>
        <a className="CommentThread__icon-button" onClick={closeCommentThreads}>
          <Icon filename="comments-close"
            style={{...styles.toolbarButton, cursor: 'pointer'}}
            />
        </a>

        <FormattedMessage
          id="comments.nResponses"
          defaultMessage={`{count, number} {count, plural,
            one {response}
            other {responses}
          }`}
          values={{count: commentThreads.length}} />

        <div style={styles.toolbarButton} />
      </div>

      <ol style={styles.commentList}>
        { commentThreads.map( (thread, i) => <CommentThread
          key={thread.id}
          cardId={cardId}
          threadId={thread.id}
          location={location} match={match} history={history}
          last={i === commentThreads.length - 1}
        />
        )}
      </ol>

      <div className="CommentThreads__footer">
        <button
          onClick={acceptingSelection ? addCommentThread : acceptSelection}
          className="CommentThreads__new-button"
          disabled={acceptingSelection && !selectionPending}
        >
          { !acceptingSelection
            ? <FormattedMessage id="comments.writeNew"
              defaultMessage="Write a new response" />
            : ( !selectionPending
              ? <FormattedMessage id="comments.select"
                defaultMessage="Select a few words" />
              : <FormattedMessage id="comments.here"
                defaultMessage="Respond here" />
            )
          }
        </button>
      </div>
    </div>

    {
      <Portal>
        <Link to={matchPath(location.pathname, elementOpen()).url} replace
          style={styles.backdrop} />
      </Portal>
    }

    <Route {...commentsOpen()} component={CommentsCard} />
  </div>

}

export default connect(
  mapStateToProps,
  {closeCommentThreads, acceptSelection},
)(CommentThreadsCard)


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
