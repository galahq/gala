export function elementOpen(position = ":position") {
  return { path: `/${position}` }
}

export function commentThreadsOpen(cardId = ":cardId") {
  return { path: `/:position/cards/${cardId}/comments` }
}

export function commentsOpen(commentThreadId = ":commentThreadId") {
  return { path: `/:position/cards/:cardId/comments/${commentThreadId}` }
}
