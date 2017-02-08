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

export const openCommentsStyle = {
  //backgroundSize: '3px 3px',
  //background: "linear-gradient(rgba(115,81,212, 1),rgba(115,81,212, 1))",
  //backgroundPosition: "0 94%",
  textShadow: 'none',
  boxShadow: 'inset 0 -0.35em 0 #9776F4',
  borderBottom: '1px solid #9776F4',
}

export const selectedCommentStyle = {
  backgroundColor: "#7351D4",
  borderBottom: "1px solid #493092",
  boxShadow: "inset 0 -0.35em 0 #493092",
  textShadow: 'none',
  color: "white",
}
