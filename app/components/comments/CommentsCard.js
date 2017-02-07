import React from 'react'
import { connect } from 'react-redux'
import { Portal } from '@blueprintjs/core'

import { openComments } from 'redux/actions.js'

function mapStateToProps(state, ownProps) {
  return {
    commentThreads: state.cardsById[ownProps.cardId].commentThreads,
  }
}

const CommentsCard = ({commentThreads, openComments}) => {
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
        <li style={{
          ...styles.commentListItem,
          borderBottom: i < commentThreads.length - 1 && '1px solid #513992',
        }}>
          <h5 style={styles.author}>Arman Golrokhian</h5>
          <p style={styles.commentSnippet}>
            This is really interesting in light of some recent research by Obama,
            Biden, et al. (2016)...
          </p>
        </li>
        )}
    </ol>

    <button style={styles.newCommentButton}>Write a new response</button>

    {
      <Portal>
        <div style={styles.backdrop} onClick={() => openComments(null)}/>
      </Portal>
    }
  </div>

}

export default connect(mapStateToProps, {openComments})(CommentsCard)


const styles = {
  commentsCard: {
    backgroundColor: "#7351D4",
    width: '16.5rem',
    position: 'absolute',
    color: '#F8DF91',
    fontFamily: 'tenso',
    fontWeight: 500,
    fontSize: '12pt',
  },

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
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '10pt',
    letterSpacing: 0.6,
    padding: '0.25em 0.25em 0 0.25em',
    borderBottom: '1px solid #351D7A',
  },

  commentList: {
    margin: '0 0 0 1em',
    minHeight: '1em',
  },

  commentListItem: {
    padding: '0.65em 0.5em 0.65em 0',
  },

  author: {
    margin: 0,
    fontFamily: 'tenso',
    fontSize: 'inherit',
    fontStyle: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: 'inherit',
  },

  commentSnippet: {
    margin: 0,
    fontWeight: 400,
    lineHeight: 1.4,
  },

  newCommentButton: {
    margin: 0,
    padding: '0.75em',
    backgroundColor: '#493092',
    borderWidth: 0,
    borderTop: '1px solid #351D7A',
    fontSize: '11pt',
    letterSpacing: 0.4,
    fontWeight: 500,
  },
}
