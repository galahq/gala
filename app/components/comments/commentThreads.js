export function addCommentThreads (content, { commentThreads = [] }) {
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
