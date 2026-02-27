/* @noflow */

import { mapStateToProps } from '../SelectedCommentThread'

const baseState = {
  caseData: {
    reader: {
      id: 'r1',
      initials: 'AR',
      name: 'Alice Reader',
      imageUrl: null,
      hashKey: 'reader-1',
    },
  },
  commentThreadsById: {},
  commentsById: {},
  cardsById: {},
  pagesById: {},
}

const ownProps = {
  match: { params: { threadId: 'thread-1' } },
}

describe('SelectedCommentThread mapStateToProps', () => {
  test('filters missing comments from responses', () => {
    const comment = {
      id: 'c1',
      commentThreadId: 1,
      content: 'Hello',
      edited: false,
      timestamp: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
      reader: {
        id: 'r1',
        initials: 'AR',
        name: 'Alice Reader',
        imageUrl: null,
        hashKey: 'reader-1',
      },
      attachments: [],
    }

    const state = {
      ...baseState,
      commentThreadsById: {
        'thread-1': {
          id: 'thread-1',
          commentIds: ['c1', 'c2'],
          commentsCount: 2,
          cardId: null,
          originalHighlightText: null,
          readerId: 1,
          readers: [
            { imageUrl: null, hashKey: 'reader-1', name: 'Alice Reader' },
          ],
          length: 0,
          start: null,
          blockIndex: null,
        },
      },
      commentsById: {
        c1: comment,
      },
    }

    const props = mapStateToProps(state, ownProps)
    expect(props.commentThreadFound).toBe(true)
    if (!props.commentThreadFound) return
    expect(props.leadComment && props.leadComment.id).toEqual('c1')
    expect(props.responses).toEqual([])
  })
})
