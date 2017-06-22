/**
 * @flow
 */

import type { RawDraftContentState } from 'draft-js'
import type { CommentThread } from 'redux/state'

export function addCommentThreads (
  content: RawDraftContentState,
  { commentThreads = [] }: { commentThreads: CommentThread[] }
) {
  let newContent = { ...content }

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
