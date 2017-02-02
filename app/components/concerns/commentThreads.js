export function addCommentThreads(content, {commentThreads = []}) {
  let newContent = {...content}

  commentThreads.forEach(thread => {
    const { id, blockIndex, start, length } = thread
    const key = `thread/${id}`

    // Add EntityRange
    newContent.blocks[blockIndex].entityRanges.push({key, offset: start, length})

    // Add Entity to EntityMap
    newContent.entityMap[key] = {
      type: "COMMENT_THREAD",
      mutability: "MUTABLE",
      data: { ...thread },
    }
  })

  return newContent
}
