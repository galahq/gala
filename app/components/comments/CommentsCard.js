import React from 'react'
import { connect } from 'react-redux'
import { Portal } from '@blueprintjs/core'

import {
  selectCommentThread,
  closeCommentThreads,
} from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
    selectedCommentThread: state.ui.selectedCommentThread,
  }
}

const CommentThreadsCard = ({commentThreads, selectedCommentThread,
                            selectCommentThread, closeCommentThreads,
                            addCommentThread}) => {
  const positionalStyles = {
    position: 'absolute',
    top: 0 /* Height of header */,
    right: -266 - 24,
  }

  return <div style={{...styles.commentsCard, ...positionalStyles}}>
    <div style={styles.header}>
      { commentThreads.length === 0
        ? "No responses"
        : `${commentThreads.length} response${commentThreads.length !== 1 && 's'}` }
    </div>

    <ol style={styles.commentList}>
      { commentThreads.map( (thread, i) =>
        <li key={thread.id} style={{
          ...styles.commentListItem,
          borderBottom: i < commentThreads.length - 1 && '1px solid #513992',
          ...(selectedCommentThread === thread.id ? {backgroundColor: "#493092"} : {}),
        }} onClick={() => selectCommentThread(thread.id)}>
          <h5 style={styles.author}>Arman Golrokhian</h5>
          <p style={styles.commentSnippet}>
            This is really interesting in light of some recent research by Obama,
            Biden, et al. (2016)...
          </p>
        </li>
        )}
    </ol>

    <button
      onClick={addCommentThread}
      className="CommentThreads__new-button"
    >
      Write a new response
    </button>

    {
      <Portal>
        <div style={styles.backdrop} onClick={closeCommentThreads}/>
      </Portal>
    }
  </div>

}

export default connect(
  mapStateToProps,
  {selectCommentThread, closeCommentThreads},
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

  commentsCard: {
    backgroundColor: "#7351D4",
    width: 267,
    position: 'absolute',
    color: '#F8DF91',
    fontFamily: 'tenso',
    fontWeight: 500,
    fontSize: '12pt',
  },

  header: {
    backgroundColor: '#493092',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '10pt',
    letterSpacing: 0.6,
    padding: '0.25em 0.25em 0 0.25em',
    borderBottom: '1px solid #351D7A',
  },

  commentList: {
    margin: 0,
    padding: 0,
    minHeight: '1em',
  },

  commentListItem: {
    padding: '0.65em 0.5em 0.65em 1em',
    listStylePosition: 'inside',
    cursor: 'pointer',
  },

  author: {
    display: 'inline',
    margin: 0,
    fontFamily: 'tenso',
    fontSize: 'inherit',
    fontStyle: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: 'inherit',
  },

  commentSnippet: {
    margin: '0 0 0 1em',
    fontWeight: 400,
    lineHeight: 1.4,
  },
}
