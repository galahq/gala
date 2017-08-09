/**
 * @flow
 */

import type { RawDraftContentState } from 'draft-js'
import type { Card } from 'redux/state'

export function addCommentThreads (content: RawDraftContentState, card: Card) {
  let newContent = { ...content }

  const commentThreads = card.commentThreads || []

  commentThreads.forEach(thread => {
    const { id, blockIndex, length } = thread
    const offset = thread.start
    const key = `thread--${id}`

    newContent.blocks[blockIndex].inlineStyleRanges.push({
      length,
      offset,
      style: 'THREAD',
    })
    newContent.blocks[blockIndex].inlineStyleRanges.push({
      length,
      offset,
      style: key,
    })
  })

  return newContent
}
