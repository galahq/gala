export function addCommentThreads(content, {commentThreads = []}) {
  let newContent = {...content}

  commentThreads.forEach(thread => {
    const { id, blockIndex, length } = thread
    const offset = thread.start
    const key = `thread--${id}`

    newContent.blocks[blockIndex].inlineStyleRanges.push({ length, offset,
                                                         style: 'THREAD' })
    newContent.blocks[blockIndex].inlineStyleRanges.push({ length, offset,
                                                         style: key })
  })

  return newContent
}

export const selectedCommentStyle = {
  backgroundSize: '3px 3px',
  background: "linear-gradient(rgba(115,81,212, 1),rgba(115,81,212, 1))",
  backgroundPosition: "0 94%",
}
