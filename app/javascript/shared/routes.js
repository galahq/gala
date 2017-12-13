/**
 * @flow
 */

export function elementOpen (position: string = ':position') {
  return { path: `/${position}` }
}

export function commentThreadsOpen (cardId: string = ':cardId') {
  return { path: `/:position/cards/${cardId}/comments` }
}

export function commentsOpen (commentThreadId: string = ':threadId') {
  return { path: `/:position/cards/:cardId/comments/${commentThreadId}` }
}
